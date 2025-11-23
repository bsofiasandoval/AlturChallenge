"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CallDetails } from "@/components/call-details";
import { CallsListProps, CallRecord } from "@/types";
import {
  formatDuration,
  formatDateTime,
  formatTag,
  getTagColor,
  getSatisfactionColor,
} from "@/types/utils";

export function CallsList({ calls }: CallsListProps) {
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCallClick = (call: CallRecord) => {
    setSelectedCall(call);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card className="w-full shadow-sm border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">Analyzed Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              <p className="font-medium">No calls analyzed yet</p>
              <p className="text-sm mt-1">Upload a recording to get started</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] font-semibold">File</TableHead>
                    <TableHead className="font-semibold">Uploaded</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Tags</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.map((call) => (
                    <TableRow
                      key={call.call_id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors group"
                      onClick={() => handleCallClick(call)}
                    >
                      <TableCell className="font-medium max-w-[180px] truncate py-4">
                        <span className="group-hover:text-primary transition-colors">
                          {call.filename}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground py-4">
                        {formatDateTime(call.uploaded_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-4">
                        <span className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                          {formatDuration(call.duration_seconds)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        {call.insights ? (
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${call.insights.satisfaction_score >= 4 ? 'bg-green-100 text-green-700' :
                            call.insights.satisfaction_score >= 3 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {call.insights.satisfaction_score}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary"></div>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {call.insights ? (
                          <div className="flex flex-wrap gap-1.5">
                            {call.insights.tags.map((tag, index) => (
                              <span
                                key={index}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${getTagColor(
                                  tag
                                )}`}
                              >
                                {formatTag(tag)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">...</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallClick(call);
                          }}
                          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] w-[90vw] max-h-[90vh] overflow-y-auto p-6 md:p-8">
          <DialogTitle className="sr-only">
            {selectedCall?.filename || "Call Details"}
          </DialogTitle>
          {selectedCall && <CallDetails call={selectedCall} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
