"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Script, ScriptSchema } from "@/types/node";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface AddScriptModalProps {
  onAddScript?: (script: Script) => void;
  className?: string;
}

const defaultScriptData = [
  {
    id: "node-1",
    type: "SpeechNode" as const,
    data: {
      message: "Welcome! This is a new script.",
    },
    edges: [],
  },
];

export default function AddScriptModal({
  onAddScript,
  className,
}: AddScriptModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<Script>({
    resolver: zodResolver(ScriptSchema),
    defaultValues: {
      name: "",
      description: "",
      scriptData: defaultScriptData,
    },
  });

  const handleSubmit = (data: Script) => {
    try {
      onAddScript?.(data);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding script:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn("flex items-center gap-2", className)}
          onClick={() => setIsOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Script
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Script</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter script name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter script description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scriptData"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Script Data (JSON) *</FormLabel>
                  <FormControl>
                    <div className="h-[300px] border rounded-md overflow-hidden">
                      <Editor
                        height="100%"
                        language="json"
                        value={JSON.stringify(field.value, null, 2)}
                        onChange={(value) => {
                          try {
                            const parsed = value
                              ? JSON.parse(value)
                              : defaultScriptData;
                            field.onChange(parsed);
                          } catch (error) {
                            field.onChange(value);
                          }
                        }}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          theme: "vs-light",
                          wordWrap: "on",
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Add Script</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
