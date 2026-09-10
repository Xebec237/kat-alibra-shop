'use client';

import React, { useState } from 'react';
import { Plus, Trash2, FolderTree, Edit2, Check } from 'lucide-react';
import { createCategory, deleteCategory } from '@/lib/actions/categories';
import { Category } from '@/lib/supabase/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface CategoriesClientProps {
  initialCategories: Category[];
  productCounts: Record<string, number>;
}

export const CategoriesClient: React.FC<CategoriesClientProps> = ({
  initialCategories,
  productCounts,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCatName, setNewCatName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSaving(true);
    setError(null);

    const result = await createCategory(newCatName.trim(), categories.length);
    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCategories((prev) => [...prev, result.category]);
    setNewCatName('');
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Supprimer cette catégorie ? Les produits rattachés seront conservés, sans catégorie.'
      )
    ) {
      return;
    }

    setError(null);
    const snapshot = categories;
    setCategories((prev) => prev.filter((c) => c.id !== id));

    const result = await deleteCategory(id);
    if (!result.ok) {
      setCategories(snapshot);
      setError(result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#2E2C24]">
          Catégories de Produits
        </h1>
        <p className="text-xs sm:text-sm text-[#726C5C] mt-1">
          Organisez vos articles par rayon pour aider vos clients à trouver plus vite.
        </p>
      </div>

      {/* Formulaire ajout rapide */}
      <Card>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <Input
            placeholder="Ex: Robes de Soirée, Chaussures, Parfums..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <Button type="submit" variant="primary" size="md" className="shrink-0" isLoading={isSaving}>
            <Plus className="w-4 h-4 mr-1.5" />
            Ajouter
          </Button>
        </form>
      </Card>

      {error ? (
        <p
          role="alert"
          className="text-xs text-[#B00020] bg-[#FCEBEC] border border-[#F5C6CB] rounded-xl px-3 py-2"
        >
          {error}
        </p>
      ) : null}

      {/* Liste des catégories */}
      {categories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl space-y-3">
          <FolderTree className="w-12 h-12 text-[#726C5C] mx-auto opacity-40" />
          <p className="font-semibold text-[#2E2C24]">Aucune catégorie</p>
          <p className="text-xs text-[#726C5C]">
            Créez votre première catégorie ci-dessus pour ranger vos articles par rayon.
          </p>
        </div>
      ) : (
      <div className="bg-[#FBF8F2] border border-[#E4DAC4] rounded-2xl overflow-hidden divide-y divide-[#E4DAC4]">
        {categories.map((category) => {
          const count = productCounts[category.id] ?? 0;

          return (
            <div
              key={category.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#F6F1E7]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EBF0DE] text-[#54602F] flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2E2C24]">
                    {category.nom}
                  </h3>
                  <p className="text-xs text-[#726C5C]">
                    {count} {count > 1 ? 'articles associés' : 'article associé'}
                  </p>
                </div>
              </div>

              {category.id !== 'cat-all' ? (
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 rounded-lg text-[#726C5C] hover:text-[#B4553C] hover:bg-[#FBECE8] transition-colors"
                  title="Supprimer la catégorie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
