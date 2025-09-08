import { Phone } from "lucide-react";
import { Button } from "./ui/button";
import { useScripts } from "@/contexts/ScriptContext";
type TestCallProps = {
  id: string;
};
export default function TestCall({ id }: TestCallProps) {
  const { startTestCall, endTestCall } = useScripts();

  return (
    <div className="mt-4 pt-3 border-t border-gray-200">
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startTestCall(id);
        }}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Phone className="w-3 h-3" />
        Test Call
      </Button>
    </div>
  );
}
