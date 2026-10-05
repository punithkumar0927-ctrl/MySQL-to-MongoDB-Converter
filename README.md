# SQL2Mongo Converter

A modern, responsive web application that converts MySQL queries into MongoDB syntax instantly.

Instead of manually rewriting SQL queries, simply paste your MySQL query, click convert, and get the corresponding MongoDB query. All conversions happen directly in the browser, so your queries remain private.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## ✨ Features

- **Instant Conversion**: Converts MySQL queries to MongoDB syntax in real time  
- **Common Query Support**: Handles `SELECT`, `INSERT`, `UPDATE`, and `DELETE` statements  
- **Complex Query Support**: Supports `JOIN`, subqueries, `GROUP BY`, `HAVING`, and aggregate functions such as `COUNT`  
- **One-Click Copy**: Easily copy the generated MongoDB query  
- **Privacy Focused**: Queries are converted locally in the browser  
- **Modern UI**: Clean dark-themed interface with gradient animations  
- **Fully Responsive**: Works smoothly on desktop, tablet, and mobile devices  

## 🚀 Tech Stack

- **React 18** — User interface  
- **TypeScript** — Type safety and better code quality  
- **Vite** — Fast development server and build tool  
- **TailwindCSS** — Modern styling  
- **Framer Motion** — Smooth animations  
- **Lucide React** — Icons  

## 📦 Installation

To run this project locally:

```bash
# Clone the repository
git clone [https://github.com/punithkumar0927-ctrl/MySQL-to-MongoDB-Converter.git](https://github.com/punithkumar0927-ctrl/MySQL-to-MongoDB-Converter.git)

# Navigate to the project folder
cd MySQL-to-MongoDB-Converter

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## 🛠️ Build for Production

```bash
# Create a production build
npm run build

# Preview the production build
npm run preview
```

## 💡 How to Use

1. Enter or paste your MySQL query in the input area  
2. Click **Convert Query** or select one of the example queries  
3. View the MongoDB equivalent in the output area  
4. Click the copy button to copy the result  

### Example Conversions

**SELECT Query:**

```sql
SELECT * FROM users WHERE age > 25;
```

Converts to:

```javascript
db.users.find({ age: { $gt: 25 } })
```

**INSERT Query:**

```sql
INSERT INTO products (name, price) VALUES ("Laptop", 999);
```

Converts to:

```javascript
db.products.insertOne({ name: "Laptop", price: 999 })
```

## 👨‍💻 Developer

**Punith Kumar AB**  
B.E. in Artificial Intelligence & Machine Learning  
GMIT, Davangere  

- 📧 Email: [punithkumar0927@gmail.com](mailto:punithkumar0927@gmail.com)  
- 🐙 GitHub: [@punithkumar0927-ctrl](https://github.com/punithkumar0927-ctrl)  

## 📄 License

This project is licensed under the MIT License.  
You are free to use, modify, and share it for learning and development purposes.

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.  
Feel free to open an issue or submit a pull request.

---

Built by Punith Kumar AB
