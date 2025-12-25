# Expense Tracker

A fully functional, responsive Expense Tracker web application built with HTML, CSS, and JavaScript.

## Features

- **Dashboard Summary**: Displays total income, total expenses, and current balance
- **Add Transaction Form**: With validation for title, amount, type, category, and date
- **Transaction List**: Shows all transactions with color coding (green for income, red for expense)
- **Filter & Search**: Filter by month, category, type, and search by title
- **Charts & Visualization**: Pie chart for category-wise expenses and bar chart for monthly income vs expense
- **Budget Management**: Set monthly budgets with alerts when exceeded
- **Export & Reset**: Export transactions to CSV and reset all data
- **Light & Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile, tablet, and desktop

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- JavaScript (ES6+)
- Chart.js (via CDN)

## How to Use

1. Open `index.html` in your web browser
2. Add transactions using the form
3. View your dashboard summary
4. Filter and search transactions
5. View charts for visual insights
6. Set budgets for different categories
7. Export your data to CSV when needed

## File Structure

```
expense-tracker/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Project Structure

- `index.html`: Main HTML structure
- `style.css`: All styling with light/dark mode support
- `script.js`: All JavaScript functionality in a class-based structure

## Functionality

### Data Management
- Transactions are stored in localStorage
- Budgets are stored in localStorage
- Theme preference is saved in localStorage

### Chart.js Integration
- Pie chart shows expenses by category
- Bar chart shows monthly income vs expenses
- Charts update dynamically when data changes

### Responsive Design
- Uses CSS Grid and Flexbox for layout
- Adapts to different screen sizes
- Mobile-first approach

## Customization

You can easily customize:
- Colors by modifying CSS variables
- Categories by updating the select options in HTML
- Chart colors and styles in JavaScript

## Deployment

This application can be deployed to:
- GitHub Pages
- Netlify
- Any static hosting service

Simply upload all files to your hosting platform.