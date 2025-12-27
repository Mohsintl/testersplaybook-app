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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateTestCaseForm({
  projectId,
  moduleId,
}: {
  projectId: string;
  moduleId: string;
}) {
  const form = useForm({
    defaultValues: {
      title: "",
      steps: "",
      expected: "",
    },
  });

  const { handleSubmit } = form;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: {
    title: string;
    steps: string;
    expected: string;
  }) {
    if (!data.title || !data.steps || !data.expected) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/test-cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        steps: data.steps.split("\n"),
        expected: data.expected,
        moduleId,
      }),
    });

    if (!res.ok) {
      setError("Failed to create test case");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <h3 className="text-lg font-medium">Create Test Case</h3>

        <FormField
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="steps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Steps (one per line)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Steps (one per line)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="expected"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Result</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Expected result" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="ml-2">
          {loading ? "Creating..." : "Add Test Case"}
        </Button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </Form>
  );
}
