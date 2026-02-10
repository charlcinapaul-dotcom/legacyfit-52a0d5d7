import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { EnrollmentStatus } from "@/hooks/useEnrollmentStatus";

interface EnrollmentBadgeProps {
  status: EnrollmentStatus;
  className?: string;
}

export function EnrollmentBadge({ status, className }: EnrollmentBadgeProps) {
  switch (status) {
    case "paid":
      return (
        <Badge className={`bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 ${className || ""}`}>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case "pending":
      return (
        <Badge className={`bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 ${className || ""}`}>
          <Clock className="w-3 h-3 mr-1" />
          Payment Pending
        </Badge>
      );
    case "not_enrolled":
      return (
        <Badge variant="outline" className={`text-muted-foreground ${className || ""}`}>
          <XCircle className="w-3 h-3 mr-1" />
          Not Enrolled
        </Badge>
      );
  }
}
