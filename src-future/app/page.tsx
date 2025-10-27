import { useEffect, useState } from "react";
import { fetchData } from "@/services/api.client";
import { Grupos } from "@/models/grupo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  const [grupos, setGrupos] = useState<Grupos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const data = await fetchData("/grupos");
        setGrupos(data);
      } catch (err) {
        setError("Failed to fetch grupos");
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Header />
      <main>
        <h1>Grupos</h1>
        <ul>
          {grupos.map((grupo) => (
            <li key={grupo.id}>{grupo.nome}</li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}