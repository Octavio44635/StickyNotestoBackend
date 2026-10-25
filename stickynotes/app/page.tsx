"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";

const API_URL = "http://localhost:3001/api/notes";
const NotasContext = createContext();

// ==========================================
// 2. CREAR EL PROVIDER (Proveedor de datos y lógica)
// ==========================================
function NotasProvider({ children }) {
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true); //True? antes estaba false
  const temporizadores = useRef({});

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setNotas(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar notas:", err);
        setCargando(false);
      });
  }, []);
  // Cargar de localStorage
  useEffect(() => {
    const notasGuardadas = localStorage.getItem("mis_notas_visuales");
    //Esto hay que cambiarlo
    if (notasGuardadas) {
      setNotas(JSON.parse(notasGuardadas));
    }
    setCargando(true);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (cargando) {
      localStorage.setItem("mis_notas_visuales", JSON.stringify(notas));
    }
  }, [notas, cargando]);

  // Manejar Notificaciones
  const mostrarNotificacion = (nota) => {
    if (!("Notification" in window)) return;
    const texto = nota.ds;
    if (Notification.permission === "granted") {
      new Notification("⏰ ¡Recordatorio!", { body: texto });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification("⏰ ¡Recordatorio!", { body: texto });
      });
    }
  };

  // Crear Nota
  const crearNota = async (texto) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ds: texto }), // Tu DTO espera { ds: string }
      });
      const nuevaNota = await res.json();
      setNotas((prev) => [...prev, nuevaNota]);
      // Temporizador de prueba (5s)
      const timerID = setTimeout(() => {
        mostrarNotificacion(nuevaNota);
      }, 5000);
      temporizadores.current[nuevaNota.id] = timerID;
    } catch (err) {
      console.error("Error al crear la nota:", err);
    }
  };

  // Eliminar Nota
  // 3. ELIMINAR NOTA (DELETE)
  const eliminarNota = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (temporizadores.current[id]) {
        clearTimeout(temporizadores.current[id]);
        delete temporizadores.current[id];
      }
      setNotas((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error al eliminar la nota:", err);
    }
  };
  // 4. EDITAR NOTA (PATCH)
  const editarTextoNota = async (id, nuevoTexto) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ds: nuevoTexto }),
      });
      setNotas((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ds: nuevoTexto } : n))
      );
    } catch (err) {
      console.error("Error al editar la nota:", err);
    }
  };
  return (
    <NotasContext.Provider value={{ notas, cargando, crearNota, eliminarNota, editarTextoNota }}>
      {children}
    </NotasContext.Provider>
  );
}

// ==========================================
// 4. COMPONENTE: FORMULARIO
// ==========================================
function FormularioNotas() { //Esto se usa aca pero creo que hay que hacer cambios
  // Consumimos el contexto para usar la función crearNota
  const { crearNota } = useContext(NotasContext);
  
  const [textoInput, setTextoInput] = useState("");
  const inputNuevaNotaRef = useRef(null);

  const manejarCreacion = () => {
    if (textoInput.trim() === "") return;
    
    crearNota(textoInput); // Usamos la función global
    
    setTextoInput("");
    if (inputNuevaNotaRef.current) {
      inputNuevaNotaRef.current.focus();
    }
  };

  return (
    <div className="flex gap-2 mb-10 w-full max-w-md">
      <input
        ref={inputNuevaNotaRef}
        type="text"
        placeholder="Escribe tu nota aquí..."
        className="flex-1 p-2 border border-gray-300 rounded text-black"
        value={textoInput}
        onChange={(e) => setTextoInput(e.target.value)}
      />
      <button
        onClick={manejarCreacion}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition-colors"
      >
        Crear Nota
      </button>
    </div>
  );
}

// ==========================================
// 5. COMPONENTE: TABLERO DE NOTAS
// ==========================================
function TableroNotas() {
  // Consumimos el contexto para leer las notas y las funciones de edición
  const { notas, editarTextoNota, eliminarNota } = useContext(NotasContext);
  const [idToEdit, setReadToEdit] = useState(null);

  return (
    <div className="flex flex-wrap gap-4 w-full justify-center">
      {notas.map((nota) => (
        <div
          key={nota.id}
          className="w-48 h-48 bg-yellow-200 text-black p-4 shadow-lg flex flex-col relative group"
        >
          {/* Botón para eliminar (visible al pasar el mouse por encima) */}
          <button 
            onClick={() => eliminarNota(nota.id)}
            className="absolute top-2 right-2 font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar nota"
          >
            ✖
          </button>

          <div 
            className="flex-1 flex flex-col mt-4" 
            onClick={() => setReadToEdit(nota.id)}
          >
            {idToEdit === nota.id ? (
              <textarea
                className="flex-1 p-2 text-black bg-white/50 border-none resize-none focus:outline-none rounded"
                defaultValue={nota.ds}
                autoFocus
                onBlur={(e) => {
                  editarTextoNota(nota.id, e.target.value);
                  setReadToEdit(null);
                }}
              />
            ) : (
              <p className="flex-1 break-words cursor-text">{nota.ds ?? nota.texto}</p>
            )}
          </div>
        </div>
      ))}
      
      {notas.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Aún no hay notas. ¡Crea una!</p>
      )}
    </div>
  );
}

// ==========================================
// 6. COMPONENTE PRINCIPAL (La Página)
// ==========================================
export default function Home() {
  return (
    // Envolvemos toda la app con el Provider para que todos tengan acceso a los datos
    <NotasProvider>
      <div className="flex flex-col items-center min-h-screen p-8 bg-zinc-50 dark:bg-zinc-900">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Mis Notas Visuales</h1>
        <FormularioNotas />
        <TableroNotas />
      </div>
    </NotasProvider>
  );
}
