export const formatDate = (date: Date): string => {
    const fecha = new Date(date); 
    const soloFecha = fecha.toISOString().split('T')[0];

    return soloFecha;
}