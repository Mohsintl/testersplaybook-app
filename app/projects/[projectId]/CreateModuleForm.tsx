"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateModuleForm({
  projectId,
}: {
  projectId: string;
}) {
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

    const res = await fetch(`/api/projects/${projectId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Failed to create module");
      setLoading(false);
      return;
    }

    // simple + reliable
    window.location.reload();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Module Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Module name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Module Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Module description"  className="h-24"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="ml-2">
          {loading ? "Creating..." : "Add Module"}
        </Button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </Form>
  );
}
