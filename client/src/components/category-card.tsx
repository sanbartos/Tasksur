import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type Category = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  priceRange: string;
};

interface CategoryCardProps {
  category: Category;
  taskCount?: number;
  className?: string;
  onClick?: (category: Category) => void;
}

export default function CategoryCard({
  category,
  taskCount = 0,
  className = "",
  onClick,
}: CategoryCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(category);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  return (
    <Card
      className={`h-full hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer ${className}`}
      aria-label={`Categoría ${category.name}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="flex flex-col items-center text-center p-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: category.color }}
        >
          <img
            src={category.icon}
            alt={`${category.name} icon`}
            className="w-10 h-10 object-contain"
            loading="lazy"
          />
        </div>

        <h3 className="text-lg font-semibold mb-1 text-tasksur-dark">
          {category.name}
        </h3>
        <p className="text-sm text-tasksur-neutral mb-2">{category.description}</p>

        <div className="text-sm font-medium text-tasksur-primary mb-1">
          {taskCount} {taskCount === 1 ? "tarea disponible" : "tareas disponibles"}
        </div>
        <div className="text-xs text-tasksur-secondary">{category.priceRange}</div>
      </CardContent>
    </Card>
  );
}




