# NextAdmin - Next.js Admin Dashboard Template and Components

**NextAdmin** is a Free, open-source Next.js admin dashboard toolkit featuring 200+ UI components and templates that come with pre-built elements, components, pages, high-quality design, integrations, and much more to help you create powerful admin dashboards with ease.


[![nextjs admin template](https://cdn.pimjo.com/nextadmin-2.png)](https://nextadmin.co/)


**NextAdmin** provides you with a diverse set of dashboard UI components, elements, examples and pages necessary for creating top-notch admin panels or dashboards with **powerful** features and integrations. Whether you are working on a complex web application or a basic website, **NextAdmin** has got you covered.

### [✨ Visit Website](https://nextadmin.co/)
### [🚀 Live Demo](https://demo.nextadmin.co/)
### [📖 Docs](https://docs.nextadmin.co/)

By leveraging the latest features of **Next.js 14** and key functionalities like **server-side rendering (SSR)**, **static site generation (SSG)**, and seamless **API route integration**, **NextAdmin** ensures optimal performance. With the added benefits of **React 18 advancements** and **TypeScript** reliability, **NextAdmin** is the ultimate choice to kickstart your **Next.js** project efficiently.

## Installation

1. Download/fork/clone the repo and Once you're in the correct directory, it's time to install all the necessary dependencies. You can do this by typing the following command:

```
npm install
```
If you're using **Yarn** as your package manager, the command will be:

```
yarn install
```

2. Okay, you're almost there. Now all you need to do is start the development server. If you're using **npm**, the command is:

```
npm run dev
```
And if you're using **Yarn**, it's:

```
yarn dev
```

And voila! You're now ready to start developing. **Happy coding**!

## Highlighted Features
**200+ Next.js Dashboard Ul Components and Templates** - includes a variety of prebuilt **Ul elements, components, pages, and examples** crafted with a high-quality design.
Additionally, features seamless **essential integrations and extensive functionalities**.

- A library of over **200** professional dashboard UI components and elements.
- Five distinctive dashboard variations, catering to diverse use-cases.
- A comprehensive set of essential dashboard and admin pages.
- More than **45** **Next.js** files, ready for use.
- Styling facilitated by **Tailwind CSS** files.
- A design that resonates premium quality and high aesthetics.
- A handy UI kit with assets.
- Over ten web apps complete with examples.
- Support for both **dark mode** and **light mode**.
- Essential integrations including - Authentication (**NextAuth**), Database (**Postgres** with **Prisma**), and Search (**Algolia**).
- Detailed and user-friendly documentation.
- Customizable plugins and add-ons.
- **TypeScript** compatibility.
- Plus, much more!

All these features and more make **NextAdmin** a robust, well-rounded solution for all your dashboard development needs.

## Update Logs

### Version 1.2.0 - Major Upgrade and UI Improvements - [Jan 27, 2025]

- Upgraded to Next.js v15 and updated dependencies
- API integration with loading skeleton for tables and charts.
- Improved code structure for better readability.
- Rebuilt components like dropdown, sidebar, and all ui-elements using accessibility practices.
- Using search-params to store dropdown selection and refetch data.
- Semantic markups, better separation of concerns and more.

### Version 1.1.0
- Updated Dependencies
- Removed Unused Integrations
- Optimized App

### Version 1.0
- Initial Release - [May 13, 2024]

# NextGem Management

## macOS Desktop Application

NextGem Management can be installed as a desktop application on macOS. This provides a native-like experience with the application running in its own window, separate from your browser.

### Creating Installer Executables

You can create installer executables for both macOS and Windows that users can download and run to install your application:

#### Universal Installer Creator

We've provided a universal installer creator script that works on both macOS and Windows:

```bash
# Replace with your actual Render deployment URL
npm run create-installer https://your-render-deployment-url.onrender.com
```

This will create:
- A `.dmg` installer for macOS (in `electron/dist`)
- A `.exe` installer for Windows (in `electron/dist`)

#### Platform-Specific Installers

1. **macOS DMG Installer**:
   - Navigate to the `electron` directory
   - Run `npm run build:mac`
   - The DMG file will be in the `dist` directory

2. **Windows EXE Installer**:
   - Navigate to the `electron` directory
   - Run `npm run build:win`
   - The EXE file will be in the `dist` directory
   
3. **Windows Installer using Inno Setup**:
   - See the `windows-installer` directory for instructions on creating a more customized Windows installer

### Installing as a Progressive Web App (PWA)

Alternatively, users can install the app directly from the browser:

1. Deploy your Next.js app to Render
2. Open the deployed app in Safari on macOS
3. From the Safari menu, select "File" > "Share" > "Add to Dock"
4. The app will now appear in your Dock like a native application

### Alternative Desktop App Options

We've provided several options for creating a desktop application:

1. **Electron**: A full-featured desktop application framework
   - See the `electron` directory for instructions

2. **Tauri**: A lightweight alternative to Electron
   - See the `tauri` directory for instructions

3. **Nativefier**: A simple command-line tool to create desktop apps
   - See the `nativefier` directory for instructions

## Deployment to Render

This project is configured for deployment on Render. Follow these steps to deploy:

### Option 1: Deploy via GitHub

1. Push your code to a GitHub repository
2. Log in to your Render account
3. Click "New" and select "Web Service"
4. Connect your GitHub repository
5. Use the following settings:
   - **Name**: nextgem-management (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `yarn install && yarn build:render`
   - **Start Command**: `yarn start:render`
6. Add the required environment variables:
   - **MONGODB_URI**: Your MongoDB connection string (required)
7. Click "Create Web Service"

### Option 2: Deploy via render.yaml

1. Push your code to a GitHub repository
2. Log in to your Render account
3. Click "New" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and configure the deployment
6. You will be prompted to enter the value for the MONGODB_URI environment variable during deployment

### Setting Up MongoDB

This application requires a MongoDB database. You can set up a free MongoDB database using MongoDB Atlas:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account or log in
2. Create a new cluster (the free tier is sufficient for development)
3. Once your cluster is created, click on "Connect"
4. Choose "Connect your application"
5. Copy the connection string and replace `<password>` with your database user's password
6. Add this connection string as the MONGODB_URI environment variable in Render

### Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in Render
2. Make sure all environment variables are properly set
3. If the build fails, you can try manually deploying by:
   - Connecting to the Render shell
   - Running `yarn build:render` manually
   - Then starting the server with `yarn start:render`
4. Common issues:
   - **MongoDB Connection Error**: Make sure your MONGODB_URI is correct and that your IP address is whitelisted in MongoDB Atlas
   - **Build Errors**: Check the build logs for specific errors

## Development

To run the development server:

1. Create a `.env.local` file in the root directory with the following content:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

2. Run the development server:
   ```bash
   yarn dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

To build the project:

```bash
yarn build
```

## Start

To start the production server:

```bash
yarn start
```
