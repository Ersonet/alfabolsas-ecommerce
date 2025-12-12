/**
 * productsData.js
 * Datos simulados (Mock Data) para la categoría Bolsas de Papel.
 * Exportamos el array 'products' para ser importado por la lógica de la vista.
 */
export const products = [
    {
        id: 1,
        name: "Bolsa de papel Kraft con Manija #0",
        price: 55000,
        image: "/frontend/assets/img/bolsas-papel/bolsa-de-papel-numero-0-kraft-blanco-alfa-bolsas.png", // AJUSTA ESTA RUTA DE IMAGEN
        tipo: "con-manija",
        material: "papel",
        color: "marron",
        description: "Ideal para domicilios de comida rápida y productos pesados.",
        units: "Paquete x100",
    },
    {
        id: 2,
        name: "Bolsa de Lujo Troquelada",
        price: 485000,
        image: "/frontend/assets/img/bolsas-papel/bolsa-de-papel-numero-1-kraft-marron-alfa-bolsas.png", // AJUSTA ESTA RUTA DE IMAGEN
        type: "troquelada",
        material: "papel",
        color: "blanco",
        description: "Acabado mate, perfecta para boutiques y regalos.",
        units: "Paquete x50",
    },
    {
        id: 3,
        name: "Bolsa Kraft Pequeña Manija Rizo",
        price: 210000,
        image: "/frontend/assets/img/bolsas-papel/bolsa-de-papel-numero-2-kraft-negra-alfa-bolsas.png", // AJUSTA ESTA RUTA DE IMAGEN
        tipo: "manija-en-cinta",
        material: "papel",
        color: "marron",
        description: "Económica y funcional para productos ligeros.",
        units: "Paquete x200",
    },
    {
        id: 4,
        name: "Bolsa Negra Premium con Manija",
        price: 520000,
        image: "/frontend/assets/img/bolsas-papel/bolsa-de-papel-numero-3-kraft-marron-alfa-bolsas.png", // AJUSTA ESTA RUTA DE IMAGEN
        tipo: "con-manija",
        material: "papel",
        color: "negro",
        description: "Elegancia y resistencia en un solo empaque.",
        units: "Paquete x100",
    },
    {
        id: 5,
        name: "Bolsa Troquelada Color",
        price: 315000,
        image: "/frontend/assets/img/bolsas-papel/bolsa-de-papel-numero-1-kraft-marron-alfa-bolsas.png", // AJUSTA ESTA RUTA DE IMAGEN
        tipo: "troquelada",
        material: "polipropileno", // Ejemplo para probar el filtro de Material
        color: "rojo",
        description: "Disponible en varios colores vivos, terminación brillante.",
        units: "Paquete x150",
    },
];