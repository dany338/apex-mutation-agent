function generatePrompt(diff, classType) {
  return `Eres un revisor experto de código en Salesforce (Apex, Flows, LWC, APIs, Tiggers, etc)...\n\n[Tu objetivo es analizar código recientemente modificado por un desarrollador y emitir sugerencias automatizadas, concisas y útiles para revisión de Pull Requests.

Evalúa el siguiente fragmento de código Apex y responde:

1. Detecta malas prácticas como:
   - Nombres ambiguos
   - Lógica repetida
   - Estructuras if anidadas en exceso
   - Errores comunes de desarrollo

2. Sugiere mejoras concisas por bloque de código.

3. Clasifica el tipo de clase (Trigger, Batch, Controller, etc.) si es posible.

4. No inventes errores si el código está bien implementado y sigue buenas prácticas.

5. Además, verifica si el código respeta las siguientes buenas prácticas:

   - No hay múltiples triggers para el mismo objeto.
   - Los triggers usan patrón Handler sin lógica embebida.
   - Se aplica Return Early para mejorar legibilidad.
   - No hay bucles anidados innecesarios.
   - No se ejecutan DML/SOQL dentro de bucles.
   - No se usan valores hardcoded (usa metadata o Custom Labels).
   - Las clases test cubren casos de error y validaciones negativas.
   - Se incluyen logs en lógica crítica.
   - Las excepciones no se silencian.
   - No se mezclan lógicas declarativas (Flow/PB) con triggers sin coordinación.
   - El código está bulkificado y optimizado para gobernanza.

6. Comenta sobre el uso de patrones como:
   - Uso adecuado de try-catch
   - Logs (debug o Logger)
   - Nombres claros y consistentes
   - Separación de lógica y presentación (MVC)

7. Si el código es correcto y sigue buenas prácticas, reconoce su calidad y mantenibilidad. ${classType}]\n\nCódigo modificado:\n===DIFF===\n${diff}`;
}

module.exports = { generatePrompt };
