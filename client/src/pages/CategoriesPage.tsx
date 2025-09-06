import React from "react";
import { Link } from "wouter";
import { categoriesWithSlug } from "../components/CategoriesDropdown";

export default function CategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
        Lista de Categorías
      </h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {categoriesWithSlug.map((category) => (
          <li key={category.slug} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer select-none">
            <Link href={`/categories/${category.slug}`} className="block p-6 text-center">
              <span className="text-lg font-semibold text-gray-800 hover:text-tasksur-primary transition-colors">
                {category.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}




