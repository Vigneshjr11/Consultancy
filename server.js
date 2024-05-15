const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB for Login
const loginDB = mongoose.createConnection('mongodb://127.0.0.1:27017/Login', { useNewUrlParser: true, useUnifiedTopology: true });
loginDB.on('error', console.error.bind(console, 'Login database connection error:'));
loginDB.once('open', () => {
    console.log('Connected to Login database');
});

// Define User schema for Login
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// Define User model for Login
const User = loginDB.model('User', userSchema);

// Connect to MongoDB for Employees
const employeesDB = mongoose.createConnection('mongodb://127.0.0.1:27017/employees', { useNewUrlParser: true, useUnifiedTopology: true });
employeesDB.on('error', console.error.bind(console, 'Employees database connection error:'));
employeesDB.once('open', () => {
    console.log('Connected to Employees database');
});

// Define Employee schema
const employeeSchema = new mongoose.Schema({
    employeeId: String,
    name: String,
    role: String,
    age: Number,
    experience: Number,
    address: String,
    phone: String,
    salary: Number
});

// Define Employee model
const Employee = employeesDB.model('Employee', employeeSchema);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Handle login route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle login route
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Find user by email in the 'users' collection in the 'Login' database
    User.findOne({ email })
        .then(user => {
            if (user) {
                // If user found, check password
                if (user.password === password) {
                    // Successful sign-in, redirect to employee.html
                    res.sendFile(path.join(__dirname, 'public', 'employee.html'));
                } else {
                    // Incorrect password, send error message
                    res.status(401).send('Incorrect password');
                }
            } else {
                // Unauthorized access, send error message
                res.status(401).send('Unauthorized user');
            }
        })
        .catch(err => {
            console.error('Error finding user:', err);
            res.status(500).send('Internal Server Error');
        });
});

// Handle signup route
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already exists in the 'users' collection in the 'Login' database
    User.findOne({ email })
        .then(user => {
            if (user) {
                // Email already exists, send error message
                res.status(400).send('Email already exists');
            } else {
                // Create new user
                const newUser = new User({ name, email, password });
                newUser.save()
                    .then(() => {
                        res.status(200).send('User created successfully');
                    })
                    .catch(err => {
                        console.error('Error creating user:', err);
                        res.status(500).send('Internal Server Error');
                    });
            }
        })
        .catch(err => {
            console.error('Error finding user:', err);
            res.status(500).send('Internal Server Error');
        });
});

// CRUD operations for employees

// Create an employee
app.post('/employees', async (req, res) => {
    try {
        const employeeData = req.body;
        const employee = new Employee(employeeData);
        const savedEmployee = await employee.save();
        res.status(201).json(savedEmployee);
    } catch (err) {
        console.error('Error adding employee:', err);
        res.status(500).json({ error: 'Failed to add employee' });
    }
});

// Read all employees
app.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Read a single employee by ID
app.get('/employees/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const employee = await Employee.findOne({ employeeId: id });
        if (!employee) {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }
        res.json(employee);
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// Update an employee
app.put('/employees/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body;
        const updatedEmployee = await Employee.findByIdAndUpdate(id, newData, { new: true });
        res.json(updatedEmployee);
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete an employee
app.delete('/employees/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Employee.findByIdAndDelete(id);
        res.status(200).send('Employee deleted successfully');
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Connect to MongoDB for Customers
const customersDB = mongoose.createConnection('mongodb://127.0.0.1:27017/Customers', { useNewUrlParser: true, useUnifiedTopology: true });
customersDB.on('error', console.error.bind(console, 'Customers database connection error:'));
customersDB.once('open', () => {
    console.log('Connected to Customers database');
});

// Define Customer schema
const customerSchema = new mongoose.Schema({
    customerId: String,
    name: String,
    email: String,
    address: String,
    phone: String
});

// Define Customer model
const Customer = customersDB.model('Customer', customerSchema);

// Handle root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

// Create a customer
app.post('/customers', async (req, res) => {
    try {
        const customerData = req.body;
        const customer = new Customer(customerData);
        const savedCustomer = await customer.save();
        res.status(201).json(savedCustomer);
    } catch (err) {
        console.error('Error adding customer:', err);
        res.status(500).json({ error: 'Failed to add customer' });
    }
});

// Read all customers
app.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Read a single customer by ID
app.get('/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const customer = await Customer.findOne({ customerId: id });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (err) {
        console.error('Error fetching customer:', err);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// Update a customer
app.put('/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body;
        const updatedCustomer = await Customer.findByIdAndUpdate(id, newData, { new: true });
        res.json(updatedCustomer);
    } catch (err) {
        console.error('Error updating customer:', err);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// Delete a customer
app.delete('/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Customer.findByIdAndDelete(id);
        res.status(200).send('Customer deleted successfully');
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

// Connect to MongoDB for Orders
const ordersDB = mongoose.createConnection('mongodb://127.0.0.1:27017/Orders', { useNewUrlParser: true, useUnifiedTopology: true });
ordersDB.on('error', console.error.bind(console, 'Orders database connection error:'));
ordersDB.once('open', () => {
    console.log('Connected to Orders database');
});

// Define Order schema
const orderSchema = new mongoose.Schema({
    orderId: String,
    company: String,
    orderName: String,
    quantity: Number,
    startDate: Date,
    endDate: Date
});

// Define Order model
const Order = ordersDB.model('Order', orderSchema);

// Handle root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'order.html'));
});

// Create an order
app.post('/orders', async (req, res) => {
    try {
        const orderData = req.body;
        const order = new Order(orderData);
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('Error adding order:', err);
        res.status(500).json({ error: 'Failed to add order' });
    }
});

// Read all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Read a single order by ID
app.get('/orders/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const order = await Order.findOne({ orderId: id });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Update an order
app.put('/orders/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(id, newData, { new: true });
        res.json(updatedOrder);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Delete an order
app.delete('/orders/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Order.findByIdAndDelete(id);
        res.status(200).send('Order deleted successfully');
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Connect to MongoDB for Machines
const machinesDB = mongoose.createConnection('mongodb://127.0.0.1:27017/Machines', { useNewUrlParser: true, useUnifiedTopology: true });
machinesDB.on('error', console.error.bind(console, 'Machines database connection error:'));
machinesDB.once('open', () => {
    console.log('Connected to Machines database');
});

// Define Machine schema
const machineSchema = new mongoose.Schema({
    machineId: String,
    machineName: String,
    lastServiceDate: Date,
    nextServiceDate: Date,
    availability: String,
    status: String
});

// Define Machine model
const Machine = machinesDB.model('Machine', machineSchema);

// Handle root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inventory.html'));
});

// Create a machine
app.post('/machines', async (req, res) => {
    try {
        const machineData = req.body;
        const machine = new Machine(machineData);
        const savedMachine = await machine.save();
        res.status(201).json(savedMachine);
    } catch (err) {
        console.error('Error adding machine:', err);
        res.status(500).json({ error: 'Failed to add machine' });
    }
});

// Read all machines
app.get('/machines', async (req, res) => {
    try {
        const machines = await Machine.find();
        res.json(machines);
    } catch (err) {
        console.error('Error fetching machines:', err);
        res.status(500).json({ error: 'Failed to fetch machines' });
    }
});

// Read a single machine by ID
app.get('/machines/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const machine = await Machine.findOne({ machineId: id });
        if (!machine) {
            res.status(404).json({ error: 'Machine not found' });
            return;
        }
        res.json(machine);
    } catch (err) {
        console.error('Error fetching machine:', err);
        res.status(500).json({ error: 'Failed to fetch machine' });
    }
});

// Update a machine
app.put('/machines/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body;
        const updatedMachine = await Machine.findByIdAndUpdate(id, newData, { new: true });
        res.json(updatedMachine);
    } catch (err) {
        console.error('Error updating machine:', err);
        res.status(500).json({ error: 'Failed to update machine' });
    }
});

// Delete a machine
app.delete('/machines/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Machine.findByIdAndDelete(id);
        res.status(200).send('Machine deleted successfully');
    } catch (err) {
        console.error('Error deleting machine:', err);
        res.status(500).json({ error: 'Failed to delete machine' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
