"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

export default function CreateProjectForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { handleSubmit } = form;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: { name: string; description: string }) {
    if (!data.name.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Failed to create project");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Project name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Project description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="ml-2 border border-black text-gray-700 hover:bg-gray-100">
          {loading ? "Creating..." : "Add Project"}
        </Button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </Form>
  );
}
