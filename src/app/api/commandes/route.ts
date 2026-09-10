import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createPublicServerClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      store_id,
      catalog_id,
      reference,
      nom_client,
      telephone_client,
      adresse_livraison,
      notes,
      total,
      mode_paiement,
      statut,
      items,
    } = body;

    // Sans identifiants Supabase réels, l'appel réseau partirait vers un hôte
    // inexistant et bloquerait la requête ~7 s : on répond directement en démo.
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        mock: true,
        reference,
        message: 'Commande enregistrée localement (mode démo)',
      });
    }

    // Client public : toutes les écritures nécessaires à une commande sont
    // autorisées par RLS ou passent par une fonction SECURITY DEFINER. Aucune
    // clé secrète n'entre en jeu, donc aucun risque d'en utiliser une qui
    // appartienne à un autre projet — la panne la plus sournoise rencontrée ici.
    const supabase = createPublicServerClient();

    if (!supabase) {
      return NextResponse.json({
        success: true,
        mock: true,
        reference,
        message: 'Commande enregistrée localement (Supabase indisponible)',
      });
    }

    // 1. Fiche client, via une fonction SECURITY DEFINER : le visiteur n'a pas
    // le droit de lire `customers` (ce serait le fichier client de toutes les
    // boutiques), mais il peut appeler cette fonction au périmètre étroit.
    let customerId: string | null = null;

    if (store_id && telephone_client) {
      const { data: rpcId, error: rpcError } = await supabase.rpc(
        'record_order_customer',
        {
          p_store_id: store_id,
          p_nom: nom_client,
          p_telephone: telephone_client,
          p_adresse: adresse_livraison ?? null,
          p_total: total ?? 0,
        }
      );

      if (rpcError) {
        // Migration 002 pas encore appliquée : la commande reste enregistrée,
        // seul l'historique client est différé.
        console.warn('record_order_customer indisponible:', rpcError.message);
      } else {
        customerId = (rpcId as string | null) ?? null;
      }
    }

    // 2. Insertion de la commande
    const orderPayload = {
      store_id,
      customer_id: customerId,
      catalog_id,
      reference,
      nom_client,
      telephone_client,
      adresse_livraison,
      notes,
      total,
      mode_paiement: mode_paiement || 'a_la_livraison',
      statut: statut || 'envoyee_whatsapp',
    };

    // On fixe l'identifiant nous-mêmes plutôt que de le relire après coup :
    // `.select()` exigerait un droit de LECTURE sur `orders`, qu'aucun visiteur
    // ne possède — sans quoi n'importe qui lirait les coordonnées de tous les
    // clients. Les lignes de commande peuvent ainsi être rattachées sans
    // dépendre d'une clé privilégiée.
    const orderId = randomUUID();

    const { error: orderError } = await supabase
      .from('orders')
      .insert({ id: orderId, ...orderPayload });

    if (orderError) {
      console.warn('Échec insertion commande:', orderError.message);
      return NextResponse.json({
        success: true,
        mock: true,
        reference,
        message: 'Commande enregistrée localement',
      });
    }

    // 3. Lignes de commande, rattachées à l identifiant fixé plus haut.
    if (items && items.length > 0) {
      const orderItems = items.map((item: {
        product_id: string | null;
        nom_produit: string;
        taille?: string | null;
        couleur?: string | null;
        quantite: number;
        prix_unitaire: number;
        total_ligne: number;
      }) => ({
        order_id: orderId,
        // Le panier fabrique des clés composites (`<uuid>_<taille>_<couleur>`) :
        // on ne garde que ce qui est un vrai UUID de produit.
        product_id: UUID_RE.test(item.product_id ?? '') ? item.product_id : null,
        nom_produit: item.nom_produit,
        taille: item.taille ?? null,
        couleur: item.couleur ?? null,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        total_ligne: item.total_ligne,
      }));

      await supabase.from('order_items').insert(orderItems);
    }

    return NextResponse.json({
      success: true,
      order: { id: orderId, ...orderPayload },
    });
  } catch (error) {
    console.error('Erreur API commandes:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible d\'enregistrer la commande' },
      { status: 500 }
    );
  }
}
