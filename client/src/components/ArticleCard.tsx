// src/components/ArticleCard.tsx
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, User } from "lucide-react";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  imageUrl?: string;
}

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // Formatear fecha
  const formattedDate = new Date(article.date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {article.imageUrl ? (
        <div className="h-48 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-4xl">📰</span>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {article.category}
          </span>
        </div>
        <h3 className="text-xl font-bold line-clamp-2">{article.title}</h3>
      </CardHeader>

      <CardContent className="flex-grow pb-2">
        <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center justify-between w-full text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <Link href={`/articles/${article.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Leer más
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}