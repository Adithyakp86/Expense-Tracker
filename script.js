// Expense Tracker Application
class ExpenseTracker {
    constructor() {
        this.transactions = [];
        this.budgets = {};
        this.pieChart = null;
        this.barChart = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
        this.setupTheme();
        this.updateMonthFilter();
        this.updateCategoryFilter();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Filter changes
        document.getElementById('month-filter').addEventListener('change', () => this.filterTransactions());
        document.getElementById('category-filter').addEventListener('change', () => this.filterTransactions());
        document.getElementById('type-filter').addEventListener('change', () => this.filterTransactions());
        document.getElementById('search').addEventListener('input', () => this.filterTransactions());

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Budget management
        document.getElementById('set-budget').addEventListener('click', () => this.setBudget());
        
        // Action buttons
        document.getElementById('export-btn').addEventListener('click', () => this.exportToCSV());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetData());
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        document.getElementById('theme-toggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Re-render charts with new theme
        this.renderCharts();
    }

    loadFromStorage() {
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            this.transactions = JSON.parse(savedTransactions);
        }

        const savedBudgets = localStorage.getItem('budgets');
        if (savedBudgets) {
            this.budgets = JSON.parse(savedBudgets);
        }
    }

    saveToStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }

    addTransaction() {
        const title = document.getElementById('title').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        // Validation
        if (!title || !amount || !date || amount <= 0) {
            alert('Please fill all fields with valid values');
            return;
        }

        const transaction = {
            id: Date.now().toString(),
            title,
            amount,
            type,
            category,
            date
        };

        this.transactions.unshift(transaction);
        this.saveToStorage();
        this.updateUI();
        
        // Reset form
        document.getElementById('transaction-form').reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToStorage();
            this.updateUI();
        }
    }

    updateUI() {
        this.updateSummary();
        this.renderTransactions();
        this.renderCharts();
        this.renderBudgets();
        this.checkBudgetAlerts();
    }

    updateSummary() {
        const summary = this.calculateSummary();
        
        document.getElementById('total-income').textContent = `$${summary.totalIncome.toFixed(2)}`;
        document.getElementById('total-expense').textContent = `$${summary.totalExpenses.toFixed(2)}`;
        document.getElementById('current-balance').textContent = `$${summary.balance.toFixed(2)}`;
    }

    calculateSummary() {
        let totalIncome = 0;
        let totalExpenses = 0;

        this.transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += transaction.amount;
            }
        });

        const balance = totalIncome - totalExpenses;

        return {
            totalIncome,
            totalExpenses,
            balance
        };
    }

    renderTransactions() {
        const tbody = document.getElementById('transactions-body');
        const emptyState = document.getElementById('empty-state');
        
        if (this.transactions.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // Get filtered transactions
        const filteredTransactions = this.getFilteredTransactions();
        
        tbody.innerHTML = filteredTransactions.map(transaction => {
            const formattedDate = this.formatDate(transaction.date);
            const amountClass = transaction.type === 'income' ? 'amount-income' : 'amount-expense';
            const typeClass = transaction.type === 'income' ? 'type-income' : 'type-expense';
            const amountSign = transaction.type === 'income' ? '+' : '-';
            
            return `
                <tr class="transaction-item">
                    <td>${formattedDate}</td>
                    <td>${transaction.title}</td>
                    <td>${transaction.category}</td>
                    <td class="${amountClass}">${amountSign}$${transaction.amount.toFixed(2)}</td>
                    <td><span class="${typeClass}">${transaction.type}</span></td>
                    <td>
                        <button class="delete-btn" onclick="expenseTracker.deleteTransaction('${transaction.id}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    getFilteredTransactions() {
        const monthFilter = document.getElementById('month-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const typeFilter = document.getElementById('type-filter').value;
        const searchValue = document.getElementById('search').value.toLowerCase();

        return this.transactions.filter(transaction => {
            // Month filter
            if (monthFilter !== 'all' && transaction.date.substring(0, 7) !== monthFilter) {
                return false;
            }

            // Category filter
            if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
                return false;
            }

            // Type filter
            if (typeFilter !== 'all' && transaction.type !== typeFilter) {
                return false;
            }

            // Search filter
            if (searchValue && !transaction.title.toLowerCase().includes(searchValue)) {
                return false;
            }

            return true;
        });
    }

    filterTransactions() {
        this.renderTransactions();
    }

    updateMonthFilter() {
        const select = document.getElementById('month-filter');
        const months = [...new Set(this.transactions.map(t => t.date.substring(0, 7)))].sort().reverse();
        
        // Clear existing options except "All Months"
        select.innerHTML = '<option value="all">All Months</option>';
        
        months.forEach(month => {
            const date = new Date(`${month}-01`);
            const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            const option = document.createElement('option');
            option.value = month;
            option.textContent = monthName;
            select.appendChild(option);
        });
    }

    updateCategoryFilter() {
        const select = document.getElementById('category-filter');
        const categories = [...new Set(this.transactions.map(t => t.category))].sort();
        
        // Clear existing options except "All Categories"
        select.innerHTML = '<option value="all">All Categories</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    renderCharts() {
        this.renderPieChart();
        this.renderBarChart();
    }

    renderPieChart() {
        const ctx = document.getElementById('pie-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.pieChart) {
            this.pieChart.destroy();
        }

        // Calculate expenses by category
        const categoryExpenses = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!categoryExpenses[t.category]) {
                    categoryExpenses[t.category] = 0;
                }
                categoryExpenses[t.category] += t.amount;
            });

        const categories = Object.keys(categoryExpenses);
        const amounts = Object.values(categoryExpenses);

        this.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#FF6384',
                        '#C9CBCF'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                }
            }
        });
    }

    renderBarChart() {
        const ctx = document.getElementById('bar-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.barChart) {
            this.barChart.destroy();
        }

        // Group transactions by month
        const monthlyData = {};
        this.transactions.forEach(t => {
            const month = t.date.substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expense += t.amount;
            }
        });

        const months = Object.keys(monthlyData).sort();
        const incomeData = months.map(month => monthlyData[month].income);
        const expenseData = months.map(month => monthlyData[month].expense);

        this.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months.map(month => {
                    const date = new Date(`${month}-01`);
                    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
                }),
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(42, 157, 143, 0.6)',
                        borderColor: 'rgba(42, 157, 143, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: 'rgba(230, 57, 70, 0.6)',
                        borderColor: 'rgba(230, 57, 70, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Income vs Expenses'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    setBudget() {
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);

        if (!amount || amount <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        this.budgets[category] = amount;
        this.saveToStorage();
        this.renderBudgets();
        document.getElementById('budget-amount').value = '';
    }

    renderBudgets() {
        const budgetList = document.getElementById('budget-list');
        
        if (Object.keys(this.budgets).length === 0) {
            budgetList.innerHTML = '<p>No budgets set yet</p>';
            return;
        }

        let budgetHTML = '<h4>Current Budgets</h4>';

        Object.entries(this.budgets).forEach(([category, limit]) => {
            const spent = this.calculateCategorySpent(category);
            const percentage = (spent / limit) * 100;
            
            let progressBarClass = 'budget-progress-bar';
            if (percentage > 90) {
                progressBarClass += ' danger';
            } else if (percentage > 70) {
                progressBarClass += ' warning';
            }

            budgetHTML += `
                <div class="budget-item">
                    <div>
                        <strong>${category}</strong><br>
                        <small>$${spent.toFixed(2)} / $${limit.toFixed(2)}</small>
                    </div>
                    <div>
                        <div class="budget-progress">
                            <div class="${progressBarClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <small>${percentage.toFixed(1)}%</small>
                    </div>
                </div>
            `;
        });

        budgetList.innerHTML = budgetHTML;
    }

    calculateCategorySpent(category) {
        return this.transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    checkBudgetAlerts() {
        const alertsContainer = document.getElementById('budget-alerts');
        const alerts = [];

        Object.entries(this.budgets).forEach(([category, limit]) => {
            const spent = this.calculateCategorySpent(category);
            if (spent > limit) {
                alerts.push(`${category}: Exceeded budget by $${(spent - limit).toFixed(2)}`);
            }
        });

        if (alerts.length > 0) {
            alertsContainer.innerHTML = alerts.map(alert => 
                `<div class="budget-alert">${alert}</div>`
            ).join('');
        } else {
            alertsContainer.innerHTML = '';
        }
    }

    exportToCSV() {
        if (this.transactions.length === 0) {
            alert('No transactions to export');
            return;
        }

        const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date'];
        const csvContent = [
            headers.join(','),
            ...this.transactions.map(t => [
                t.id,
                `"${t.title}"`,
                t.amount,
                t.type,
                t.category,
                t.date
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            this.transactions = [];
            this.budgets = {};
            this.saveToStorage();
            this.updateUI();
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});