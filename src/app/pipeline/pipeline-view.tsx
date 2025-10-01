'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Stage, Opportunity } from "@/lib/types";
import { OpportunityForm } from "./opportunity-form";
import { StageForm } from "./stage-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createDeal, updateDeal, createPipelineStage } from "@/lib/api.client";

interface PipelineViewProps {
  initialStages: Stage[];
  initialDeals: Opportunity[];
}

export function PipelineView({ initialStages, initialDeals }: PipelineViewProps) {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [deals, setDeals] = useState<Opportunity[]>(initialDeals);
  const [isAddDealDialogOpen, setIsAddDealDialogOpen] = useState(false);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const deal = deals.find(d => d.id.toString() === draggableId);
    if (deal) {
      const newDeals = Array.from(deals);
      const dealIndex = newDeals.findIndex(d => d.id.toString() === draggableId);
      newDeals.splice(dealIndex, 1);
      const newDeal = {
        ...deal,
        stage: stages.find(s => s.id.toString() === destination.droppableId),
      };
      newDeals.splice(destination.index, 0, newDeal);
      setDeals(newDeals);

      updateDeal(deal.id, { stageId: parseInt(destination.droppableId) }).catch(err => {
        toast({ variant: "destructive", title: "Error", description: err.message });
        // Revert the change if the API call fails
        setDeals(deals);
      });
    }
  };

  const handleCreateDeal = async (data: Partial<Opportunity>) => {
    try {
      const newDeal = await createDeal({ ...data, stageId: selectedStageId });
      setDeals([newDeal, ...deals]);
      toast({ title: "Success", description: "Deal created successfully." });
      setIsAddDealDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleCreateStage = async (data: Partial<Stage>) => {
    try {
      const newStage = await createPipelineStage(data);
      setStages([...stages, newStage]);
      toast({ title: "Success", description: "Stage created successfully." });
      setIsAddStageDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddStageDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Stage
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <Droppable droppableId={stage.id.toString()} key={stage.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="w-72 bg-muted rounded-lg p-2 flex-shrink-0"
                >
                  <CardHeader className="p-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{stage.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedStageId(stage.id); setIsAddDealDialogOpen(true); }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2">
                    {deals
                      .filter(deal => deal.stage?.id === stage.id)
                      .map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-card p-3 rounded-lg shadow"
                            >
                              <p className="font-semibold">{deal.customer.name}</p>
                              <p className="text-sm text-muted-foreground">{deal.items?.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </CardContent>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={isAddDealDialogOpen} onOpenChange={setIsAddDealDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
          </DialogHeader>
          <OpportunityForm onSubmit={handleCreateDeal} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
          </DialogHeader>
          <StageForm onSubmit={handleCreateStage} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
