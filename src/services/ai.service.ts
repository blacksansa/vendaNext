import { api } from "@/lib/api";

export interface AIInsight {
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
}

export interface AIInsightsResponse {
  insights: AIInsight[];
  generatedAt: string;
  period: string;
}

class AIService {
  async getDashboardInsights(): Promise<AIInsightsResponse> {
    console.log("[AIService] Buscando insights do dashboard");
    try {
      const response = await api.get<AIInsightsResponse>("/ai/dashboard-insights");
      console.log("[AIService] Insights recebidos:", response);
      return response.data;
    } catch (error) {
      console.error("[AIService] Erro ao buscar insights:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();
