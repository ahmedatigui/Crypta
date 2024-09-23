import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SocketInitRequest } from "@/lib/types";

export const IncomingRequestDialog = ({ isOpen, onOpenChange, request, onAccept, onReject }: { isOpen: bool, onOpenChange: () => void, request: SocketInitRequest, onAccept: () => void, onReject: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Incoming Request</DialogTitle>
          <DialogDescription>
            You have a new connection request. Would you like to accept or reject?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://robohash.org/${request?.sender?.username}`} alt={request?.sender?.username} />
            <AvatarFallback>{request?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{request?.sender?.name}</h4>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{request?.info.name}</p>
        <DialogFooter className="sm:justify-start">
          <Button variant="secondary" onClick={onReject}>
            Reject
          </Button>
          <Button onClick={onAccept}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

