# YouTube Clone - Full Stack Project

A full-stack YouTube clone built with Node.js, Express, MongoDB, and React.

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- **User Authentication**: JWT-based login/register system
- **Video Management**: Upload, view, like/dislike videos
- **Comments System**: Add and manage comments on videos
- **User Profiles**: Channel management and subscriptions
- **Playlists**: Create and manage video playlists
- **Dashboard**: Analytics and statistics
- **File Upload**: Cloudinary integration for video and image storage

### Frontend (React + Vite + Tailwind CSS)
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Video Player**: HTML5 video player with controls
- **User Authentication**: Login/register forms with validation
- **Dashboard**: User statistics and analytics
- **Video Grid**: Responsive video gallery
- **Comments**: Real-time comment system
- **Search**: Video search functionality
- **Responsive Design**: Mobile-friendly interface

## 📁 Project Structure

```
Youtube_clone/
├── src/                    # Backend source code
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── utils/             # Utility functions
│   └── db/                # Database configuration
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── public/            # Static assets
└── package.json           # Root package.json
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage
- **bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Youtube_clone
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development servers**

   **Option 1: Run both servers simultaneously**
   ```bash
   npm run dev:full
   ```

   **Option 2: Run servers separately**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run frontend
   ```

5. **Access the application**
   - Backend API: http://localhost:8000
   - Frontend: http://localhost:5173

## 📚 API Endpoints

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout

### Videos
- `GET /api/v1/videos` - Get all videos
- `GET /api/v1/videos/:id` - Get video by ID
- `POST /api/v1/videos` - Upload video
- `PATCH /api/v1/videos/:id` - Update video
- `DELETE /api/v1/videos/:id` - Delete video

### Comments
- `GET /api/v1/comments/video/:videoId` - Get video comments
- `POST /api/v1/comments` - Add comment
- `PATCH /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Likes
- `POST /api/v1/likes/toggle/video` - Toggle video like/dislike
- `GET /api/v1/likes/video/:videoId` - Get video likes

### Dashboard
- `GET /api/v1/dashboard/stats` - Get user statistics

## 🎨 Frontend Pages

- **Home** (`/`) - Trending videos
- **Watch** (`/watch/:id`) - Video player with comments
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **Dashboard** (`/dashboard`) - User analytics
- **Channel** (`/channel/:id`) - User channel page

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start backend development server
- `npm run frontend` - Start frontend development server
- `npm run dev:full` - Start both servers simultaneously
- `npm run frontend:build` - Build frontend for production
- `npm run install:all` - Install all dependencies

### Frontend Directory
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌟 Features in Detail

### Video Upload
- Drag and drop file upload
- Video thumbnail generation
- Progress tracking
- File validation

### User Experience
- Responsive design for all devices
- Dark/light mode support
- Loading states and error handling
- Real-time updates

### Security
- JWT authentication
- Password hashing
- Input validation
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Ganesh Pawar**

---

## 🚀 Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Set up MongoDB Atlas for database
- Configure environment variables

### Frontend Deployment
- Build the project: `npm run frontend:build`
- Deploy to Vercel, Netlify, or similar platforms
- Update API base URL for production

## 📞 Support

For support and questions, please open an issue in the repository.


