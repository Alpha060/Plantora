"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types";

interface CategoryWithChildren extends Category {
  children: Category[];
}

interface CategoryTreeProps {
  categories: CategoryWithChildren[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoryTreeProps) {
  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <CategoryNode
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
}

function CategoryNode({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  category: CategoryWithChildren;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white transition-colors group hover:bg-gray-50",
          !category.is_active && "opacity-60"
        )}
      >
        {/* Drag Handle */}
        <GripVertical className="h-4 w-4 text-gray-300 cursor-grab shrink-0" />

        {/* Expand/Collapse */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-6 w-6 flex items-center justify-center rounded shrink-0 transition-colors",
            hasChildren
              ? "hover:bg-emerald-50 text-gray-500"
              : "invisible"
          )}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </button>

        {/* Icon */}
        {isExpanded ? (
          <FolderOpen className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
        ) : (
          <Folder className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
        )}

        {/* Image */}
        {category.image_url && (
          <div className="relative h-8 w-8 rounded overflow-hidden border shrink-0">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        )}

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {category.name}
            </span>
            <span className="text-xs text-muted-foreground">
              /{category.slug}
            </span>
          </div>
          {category.description && (
            <p className="text-xs text-muted-foreground truncate">
              {category.description}
            </p>
          )}
        </div>

        {/* Children Count */}
        {hasChildren && (
          <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
            {category.children.length} sub
          </Badge>
        )}

        {/* Status */}
        {!category.is_active && (
          <Badge variant="outline" className="text-[10px] h-5 text-gray-400 shrink-0">
            Hidden
          </Badge>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleActive(category)}
            title={category.is_active ? "Hide" : "Show"}
          >
            {category.is_active ? (
              <EyeOff className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-emerald-500" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(category)}
          >
            <Pencil className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-10 mt-1 space-y-1 border-l-2 border-emerald-100 pl-3">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={{ ...child, children: [] }}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
