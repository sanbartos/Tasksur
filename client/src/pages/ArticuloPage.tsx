import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image: string;
  href: string;
  content?: string;
}

export default function ArticuloPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: article, isLoading, error } = useQuery<Article, Error>({
  queryKey: ["article", slug],
  queryFn: async () => {
    const res = await fetch(`/api/articles/${slug}`);
    if (!res.ok) {
      throw new Error("Artículo no encontrado");
    }
    return res.json();
  },
  retry: false,
  staleTime: 1000 * 60 * 5,
});

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-600">Cargando artículo...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-center text-red-600">Error: {error.message}</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-600">Artículo no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <article>
        <header className="mb-6">
          <h1 className="text-4xl font-bold mb-2">{article.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(article.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ "}
            <span className="uppercase font-semibold">{article.tag}</span>
          </p>
        </header>

        <figure className="mb-6">
          <img
            src={article.image}
            alt={article.title}
            className="w-full rounded-lg object-cover max-h-96"
            loading="lazy"
          />
        </figure>

        <section className="prose max-w-none">
          {/* Si tienes contenido completo, muéstralo aquí */}
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p>{article.excerpt}</p>
          )}
        </section>
      </article>
    </main>
  );
}




