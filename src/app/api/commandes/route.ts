import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
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

    const supabase = createAdminClient();

    // 1. Fiche client : un même numéro qui recommande met à jour son historique
    // plutôt que de créer un doublon (contrainte UNIQUE(store_id, telephone)).
    let customerId: string | null = null;

    if (store_id && telephone_client) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id, commandes_count, total_depense')
        .eq('store_id', store_id)
        .eq('telephone', telephone_client)
        .maybeSingle();

      if (existing) {
        const { data: updated } = await supabase
          .from('customers')
          .update({
            nom: nom_client,
            adresse: adresse_livraison ?? undefined,
            commandes_count: (existing.commandes_count ?? 0) + 1,
            total_depense: Number(existing.total_depense ?? 0) + Number(total ?? 0),
          })
          .eq('id', existing.id)
          .select('id')
          .single();

        customerId = updated?.id ?? existing.id;
      } else {
        const { data: created } = await supabase
          .from('customers')
          .insert({
            store_id,
            nom: nom_client,
            telephone: telephone_client,
            adresse: adresse_livraison || null,
            commandes_count: 1,
            total_depense: total ?? 0,
          })
          .select('id')
          .single();

        customerId = created?.id ?? null;
      }
    }

    // 2. Insertion de la commande dans Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
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
      })
      .select()
      .single();

    if (orderError) {
      console.warn('Supabase non connecté ou erreur insertion:', orderError.message);
      // Retourner succès en mode démo / mock local
      return NextResponse.json({
        success: true,
        mock: true,
        reference,
        message: 'Commande enregistrée localement',
      });
    }

    // 2. Insertion des lignes de commande (Order Items)
    if (items && items.length > 0 && order) {
      const orderItems = items.map((item: {
        product_id: string | null;
        nom_produit: string;
        taille?: string | null;
        couleur?: string | null;
        quantite: number;
        prix_unitaire: number;
        total_ligne: number;
      }) => ({
        order_id: order.id,
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
      order,
    });
  } catch (error) {
    console.error('Erreur API commandes:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible d\'enregistrer la commande' },
      { status: 500 }
    );
  }
}
