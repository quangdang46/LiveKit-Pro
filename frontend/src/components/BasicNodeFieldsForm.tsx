import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type BasicNodeFieldsFormProps = {
  form: UseFormReturn<any>;
};

export function BasicNodeFieldsForm({ form }: BasicNodeFieldsFormProps) {
  return (
    <>
      <FormField
        control={form.control as any}
        name={"number" as any}
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel>Number</FormLabel>
            <FormControl>
              <Input type="number" {...field} placeholder="Enter number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control as any}
        name={"text" as any}
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel>Text</FormLabel>
            <FormControl>
              <Input type="text" {...field} placeholder="Enter text" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
