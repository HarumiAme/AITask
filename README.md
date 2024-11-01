# Gestor de lista de tareas con asistente de IA
![image](https://github.com/user-attachments/assets/b951f9cd-a227-47d5-affa-2dda18ef2b2f)
#### [Versión en linea](https://ai-task-seven.vercel.app)

## QR Code
![qr-code_Small](https://github.com/user-attachments/assets/1ee226ab-c0c7-43c4-8513-22b64730959a)

### [Reporte y presentación de proyecto](./Docs)

## Instrucciones 
### Clonar proyecto
```bash
git clone https://github.com/HarumiAme/AITask.git
cd AITask
```
### Instalar dependencias
```bash
npm install
```
### Agregar tus clave de API y otros datos de openAI y firebase (en la raíz del proyecto)
```bash
echo "OPENAI_API_KEY=[API]" > .env
echo "VITE_FIREBASE_API_KEY=[API]" >> .env
echo "VITE_FIREBASE_AUTH_DOMAIN=[DOMAIN]" >> .env
echo "VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]" >> .env
echo "VITE_FIREBASE_STORAGE_BUCKET=[STORAGE_BUCKET]" >> .env
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=[SENDER_ID]" >> .env
echo "VITE_FIREBASE_APP_ID=[APP_ID]" >> .env
```
### Ejecutar
```bash
npm run dev
```
