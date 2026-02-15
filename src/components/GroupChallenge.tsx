import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, LogIn, Copy, Trophy, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGroupChallenge, GroupMember } from "@/hooks/useGroupChallenge";
import { toast } from "sonner";

interface GroupChallengeProps {
  challengeId: string;
  totalMiles: number;
  isEnrolled: boolean;
}

export const GroupChallenge = ({ challengeId, totalMiles, isEnrolled }: GroupChallengeProps) => {
  const { group, isLoading, createGroup, joinGroup } = useGroupChallenge(challengeId);
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [groupName, setGroupName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isLoading) return null;

  // Already in a group — show progress
  if (group) {
    const sorted = [...group.members].sort((a, b) => b.milesLogged - a.milesLogged);

    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(group.inviteCode);
              toast.success("Invite code copied!");
            }}
          >
            <Copy className="w-4 h-4 mr-1" />
            {group.inviteCode}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Share the invite code and group password with friends so they can join.
        </p>

        <div className="space-y-4">
          {sorted.map((member, index) => (
            <MemberRow key={member.userId} member={member} totalMiles={totalMiles} rank={index + 1} />
          ))}
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Group Challenge</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          You must be enrolled in this challenge before creating or joining a group. Pay to enroll first!
        </p>
      </div>
    );
  }

  // Not in a group — show create/join options
  if (mode === "idle") {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Group Challenge</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Walk together! Create a group or join an existing one to track progress with friends.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setMode("create")} className="flex-1">
            <Plus className="w-4 h-4 mr-2" /> Create Group
          </Button>
          <Button variant="outline" onClick={() => setMode("join")} className="flex-1">
            <LogIn className="w-4 h-4 mr-2" /> Join Group
          </Button>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    if (!groupName.trim() || !password.trim()) return;
    createGroup.mutate({ name: groupName.trim(), password: password.trim() });
  };

  const handleJoin = () => {
    if (!inviteCode.trim() || !password.trim()) return;
    joinGroup.mutate({ inviteCode: inviteCode.trim(), password: password.trim() });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          {mode === "create" ? "Create a Group" : "Join a Group"}
        </h3>
      </div>

      <div className="space-y-4">
        {mode === "create" ? (
          <>
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input id="group-name" placeholder="e.g. The Trailblazers" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="group-password">Group Password</Label>
              <div className="relative">
                <Input
                  id="group-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Set a password for members to join"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input id="invite-code" placeholder="Enter the group invite code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="join-password">Group Password</Label>
              <div className="relative">
                <Input
                  id="join-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter the group password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setMode("idle")} className="flex-1">Cancel</Button>
          <Button
            onClick={mode === "create" ? handleCreate : handleJoin}
            disabled={mode === "create" ? createGroup.isPending : joinGroup.isPending}
            className="flex-1"
          >
            {(mode === "create" ? createGroup.isPending : joinGroup.isPending) ? "Loading..." : mode === "create" ? "Create" : "Join"}
          </Button>
        </div>
      </div>
    </div>
  );
};

function MemberRow({ member, totalMiles, rank }: { member: GroupMember; totalMiles: number; rank: number }) {
  const percent = Math.min(100, (member.milesLogged / totalMiles) * 100);
  return (
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        rank === 1 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
      )}>
        {rank === 1 ? <Trophy className="w-4 h-4" /> : rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground truncate">
            {member.displayName || member.bibNumber || "Walker"}
          </span>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">
            {member.milesLogged} / {totalMiles} mi
          </span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>
    </div>
  );
}
