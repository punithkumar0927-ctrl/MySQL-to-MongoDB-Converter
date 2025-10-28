# SQL2Mongo Converter

A modern, responsive web application that converts MySQL queries to MongoDB syntax instantly.

![SQL2Mongo Converter](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## ✨ Features

- **Instant Conversion**: Real-time MySQL to MongoDB query conversion
- **Accurate Translation**: Supports SELECT, INSERT, UPDATE, DELETE statements
- **Complex Queries**: Handles JOINs, subqueries, aggregations (GROUP BY, HAVING, COUNT, etc.)
- **Copy to Clipboard**: Easy one-click copy functionality
- **Privacy Focused**: All conversions happen locally in your browser
- **Responsive Design**: Beautiful dark-themed UI with gradient animations
- **Mobile Responsive**: Works seamlessly on all devices

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS 3** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/punithkumar0927-ctrl/mysql-to-mongodb-converter.git

# Navigate to project directory
cd mysql-to-mongodb-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🛠️ Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 💡 Usage

1. Enter your MySQL query in the input area
2. Click "Convert Query" button or use example queries
3. View the MongoDB equivalent in the output area
4. Copy the result with one click

### Example Conversions

**SELECT Query:**
```sql
SELECT * FROM users WHERE age > 25
```
Converts to:
```javascript
db.users.find({ age: { $gt: 25 } })
```

**INSERT Query:**
```sql
INSERT INTO products (name, price) VALUES ("Laptop", 999)
```
Converts to:
```javascript
db.products.insertOne({ name: "Laptop", price: 999 })
```

## 👨‍💻 Developer

**Punith Kumar AB**
- B.E in Artificial Intelligence & Machine Learning
- GMIT Davangere
- 📧 Email: [punithkumar0927@gmail.com](mailto:punithkumar0927@gmail.com)
- 🐙 GitHub: [@punithkumar0927-ctrl](https://github.com/punithkumar0927-ctrl)

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ by Punith Kumar AB
