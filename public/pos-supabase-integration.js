// Supabase Integration Functions for POS System

// ============= WORKER MANAGEMENT =============

async function addWorker() {
    const username = document.getElementById('workerName').value;
    const email = document.getElementById('workerEmail').value;
    const password = document.getElementById('workerPass').value;
    
    if (!username || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                username: username
            }
        });
        
        if (authError) throw authError;
        
        // Create worker role
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: authData.user.id, role: 'worker' });
        
        if (roleError) throw roleError;
        
        document.getElementById('workerName').value = '';
        document.getElementById('workerEmail').value = '';
        document.getElementById('workerPass').value = '';
        
        await loadWorkers();
        alert(`Worker "${username}" added successfully!`);
    } catch (error) {
        console.error('Error adding worker:', error);
        alert('Error adding worker: ' + error.message);
    }
}

async function loadWorkers() {
    try {
        // Get all workers with their profiles
        const { data: workers, error } = await supabase
            .from('profiles')
            .select(`
                *,
                user_roles!inner(role)
            `)
            .eq('user_roles.role', 'worker');
        
        if (error) throw error;
        
        const table = document.getElementById('workerTable');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        for (const worker of workers) {
            const row = table.insertRow();
            row.insertCell(0).textContent = worker.username;
            
            // Get user email
            const { data: authUser } = await supabase.auth.admin.getUserById(worker.user_id);
            row.insertCell(1).textContent = authUser?.user?.email || 'N/A';
            
            const statusCell = row.insertCell(2);
            if (worker.active) {
                statusCell.innerHTML = '<span class="status-active">Active</span>';
            } else {
                statusCell.innerHTML = '<span class="status-inactive">Inactive</span>';
            }
            
            // Calculate worker financials
            const workerBalance = await calculateWorkerBalance(worker.user_id);
            
            const { data: workerTransactions } = await supabase
                .from('transactions')
                .select('total')
                .eq('worker_id', worker.user_id);
            
            const { data: workerExpenditures } = await supabase
                .from('expenditures')
                .select('amount')
                .eq('worker_id', worker.user_id);
            
            const workerSales = (workerTransactions || []).reduce((sum, t) => sum + parseFloat(t.total), 0);
            const workerExpenses = (workerExpenditures || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);
            
            row.insertCell(3).textContent = `Ksh.${workerSales.toFixed(2)}`;
            row.insertCell(4).textContent = `Ksh.${workerExpenses.toFixed(2)}`;
            row.insertCell(5).textContent = `Ksh.${workerBalance.toFixed(2)}`;
            
            // Shift info
            const { data: currentShift } = await supabase
                .from('worker_shifts')
                .select('*')
                .eq('worker_id', worker.user_id)
                .eq('active', true)
                .single();
            
            const currentShiftCell = row.insertCell(6);
            if (currentShift) {
                const duration = Date.now() - new Date(currentShift.start_time).getTime();
                currentShiftCell.textContent = formatDuration(duration);
            } else {
                currentShiftCell.textContent = 'Not active';
            }
            
            const { data: lastShift } = await supabase
                .from('worker_shifts')
                .select('duration')
                .eq('worker_id', worker.user_id)
                .eq('active', false)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            const lastShiftCell = row.insertCell(7);
            lastShiftCell.textContent = lastShift?.duration ? formatDuration(lastShift.duration) : 'N/A';
            
            const actionsCell = row.insertCell(8);
            
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = worker.active ? 'Disable' : 'Enable';
            toggleBtn.className = worker.active ? 'danger-btn' : 'success-btn';
            toggleBtn.onclick = () => toggleWorkerStatus(worker.user_id, worker.active);
            actionsCell.appendChild(toggleBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'danger-btn';
            deleteBtn.onclick = () => deleteWorker(worker.user_id, worker.username);
            actionsCell.appendChild(deleteBtn);
        }
    } catch (error) {
        console.error('Error loading workers:', error);
    }
}

async function toggleWorkerStatus(userId, currentStatus) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ active: !currentStatus })
            .eq('user_id', userId);
        
        if (error) throw error;
        
        await loadWorkers();
    } catch (error) {
        console.error('Error toggling worker status:', error);
        alert('Error updating worker status');
    }
}

async function deleteWorker(userId, username) {
    if (!confirm(`Are you sure you want to delete worker ${username}?`)) return;
    
    try {
        // Delete auth user (cascades to profiles and user_roles)
        const { error } = await supabase.auth.admin.deleteUser(userId);
        
        if (error) throw error;
        
        await loadWorkers();
        alert('Worker deleted successfully');
    } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Error deleting worker: ' + error.message);
    }
}

async function calculateWorkerBalance(userId) {
    const { data: workerTransactions } = await supabase
        .from('transactions')
        .select('total')
        .eq('worker_id', userId);
    
    const { data: workerExpenditures } = await supabase
        .from('expenditures')
        .select('amount')
        .eq('worker_id', userId);
    
    const sales = (workerTransactions || []).reduce((sum, t) => sum + parseFloat(t.total), 0);
    const expenses = (workerExpenditures || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    return sales - expenses;
}

// ============= PRODUCT MANAGEMENT =============

async function addProduct() {
    const name = document.getElementById('productName').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const price = parseFloat(document.getElementById('productPrice').value);
    
    if (!name || isNaN(stock) || isNaN(price)) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('products')
            .insert({
                name: name,
                stock: stock,
                price: price,
                created_by: currentUser.id
            });
        
        if (error) throw error;
        
        document.getElementById('productName').value = '';
        document.getElementById('productStock').value = '';
        document.getElementById('productPrice').value = '';
        
        await loadProducts();
        alert('Product added successfully');
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product: ' + error.message);
    }
}

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        products = data || [];
        
        const table = document.getElementById('productTable');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        products.forEach(product => {
            const row = table.insertRow();
            row.insertCell(0).textContent = product.name;
            
            const stockCell = row.insertCell(1);
            stockCell.textContent = product.stock;
            if (product.stock === 0) {
                stockCell.className = 'out-of-stock';
            } else if (product.stock < 5) {
                stockCell.className = 'low-stock';
            }
            
            row.insertCell(2).textContent = `Ksh.${parseFloat(product.price).toFixed(2)}`;
            
            const actionsCell = row.insertCell(3);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => editProduct(product.id);
            actionsCell.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'danger-btn';
            deleteBtn.onclick = () => deleteProduct(product.id);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('Enter new product name:', product.name);
    if (newName === null) return;
    
    const newStock = prompt('Enter new stock:', product.stock);
    if (newStock === null) return;
    
    const newPrice = prompt('Enter new price:', product.price);
    if (newPrice === null) return;
    
    try {
        const { error } = await supabase
            .from('products')
            .update({
                name: newName,
                stock: parseInt(newStock),
                price: parseFloat(newPrice)
            })
            .eq('id', id);
        
        if (error) throw error;
        
        await loadProducts();
        if (userRole === 'worker') {
            await loadWorkerProducts();
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadProducts();
        if (userRole === 'worker') {
            await loadWorkerProducts();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

// ============= SERVICE MANAGEMENT =============

async function addService() {
    const name = document.getElementById('serviceName').value;
    const price = parseFloat(document.getElementById('servicePrice').value);
    
    if (!name || isNaN(price)) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('services')
            .insert({
                name: name,
                price: price,
                created_by: currentUser.id
            });
        
        if (error) throw error;
        
        document.getElementById('serviceName').value = '';
        document.getElementById('servicePrice').value = '';
        
        await loadServices();
        alert('Service added successfully');
    } catch (error) {
        console.error('Error adding service:', error);
        alert('Error adding service: ' + error.message);
    }
}

async function loadServices() {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        services = data || [];
        
        const table = document.getElementById('serviceTable');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        services.forEach(service => {
            const row = table.insertRow();
            row.insertCell(0).textContent = service.name;
            row.insertCell(1).textContent = `Ksh.${parseFloat(service.price).toFixed(2)}`;
            
            const actionsCell = row.insertCell(2);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => editService(service.id);
            actionsCell.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'danger-btn';
            deleteBtn.onclick = () => deleteService(service.id);
            actionsCell.appendChild(deleteBtn);
        });
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    const newName = prompt('Enter new service name:', service.name);
    if (newName === null) return;
    
    const newPrice = prompt('Enter new price:', service.price);
    if (newPrice === null) return;
    
    try {
        const { error } = await supabase
            .from('services')
            .update({
                name: newName,
                price: parseFloat(newPrice)
            })
            .eq('id', id);
        
        if (error) throw error;
        
        await loadServices();
        if (userRole === 'worker') {
            await loadWorkerServices();
        }
    } catch (error) {
        console.error('Error updating service:', error);
        alert('Error updating service');
    }
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadServices();
        if (userRole === 'worker') {
            await loadWorkerServices();
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting service');
    }
}

// ============= WORKER PRODUCT/SERVICE FUNCTIONS =============

async function workerAddProduct() {
    const name = document.getElementById('workerProductName').value;
    const stock = parseInt(document.getElementById('workerProductStock').value);
    const price = parseFloat(document.getElementById('workerProductPrice').value);
    
    if (!name || isNaN(stock) || isNaN(price)) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    await addProduct(); // Reuse the same function
}

async function workerAddService() {
    const name = document.getElementById('workerServiceName').value;
    const price = parseFloat(document.getElementById('workerServicePrice').value);
    
    if (!name || isNaN(price)) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    await addService(); // Reuse the same function
}

async function loadWorkerProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        products = data || [];
        
        const table = document.getElementById('workerProductTable');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        products.forEach(product => {
            const row = table.insertRow();
            row.insertCell(0).textContent = product.name;
            
            const stockCell = row.insertCell(1);
            stockCell.textContent = product.stock;
            if (product.stock === 0) {
                stockCell.className = 'out-of-stock';
            } else if (product.stock < 5) {
                stockCell.className = 'low-stock';
            }
            
            row.insertCell(2).textContent = `Ksh.${parseFloat(product.price).toFixed(2)}`;
            
            const actionsCell = row.insertCell(3);
            const addBtn = document.createElement('button');
            addBtn.textContent = 'Add to Sale';
            addBtn.onclick = () => addToSale(product, 'product');
            actionsCell.appendChild(addBtn);
        });
    } catch (error) {
        console.error('Error loading worker products:', error);
    }
}

async function loadWorkerServices() {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        services = data || [];
        
        const table = document.getElementById('workerServiceTable');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        services.forEach(service => {
            const row = table.insertRow();
            row.insertCell(0).textContent = service.name;
            row.insertCell(1).textContent = `Ksh.${parseFloat(service.price).toFixed(2)}`;
            
            const actionsCell = row.insertCell(2);
            const addBtn = document.createElement('button');
            addBtn.textContent = 'Add to Sale';
            addBtn.onclick = () => addToSale(service, 'service');
            actionsCell.appendChild(addBtn);
        });
    } catch (error) {
        console.error('Error loading worker services:', error);
    }
}

// ============= TRANSACTION MANAGEMENT =============

let currentSale = { items: [], subtotal: 0, discount: null, discountAmount: 0, total: 0 };

function addToSale(item, type) {
    const existingItem = currentSale.items.find(i => i.id === item.id && i.type === type);
    
    if (existingItem) {
        if (type === 'product') {
            existingItem.quantity++;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        }
    } else {
        currentSale.items.push({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: type === 'product' ? 1 : 1,
            subtotal: parseFloat(item.price),
            type: type
        });
    }
    
    updateSaleDisplay();
}

function removeFromSale(index) {
    currentSale.items.splice(index, 1);
    updateSaleDisplay();
}

function updateSaleDisplay() {
    const table = document.getElementById('saleItems');
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    
    currentSale.subtotal = 0;
    
    currentSale.items.forEach((item, index) => {
        const row = table.insertRow();
        row.insertCell(0).textContent = item.name;
        row.insertCell(1).textContent = item.type === 'product' ? item.quantity : 'N/A';
        row.insertCell(2).textContent = `Ksh.${item.price.toFixed(2)}`;
        row.insertCell(3).textContent = `Ksh.${item.subtotal.toFixed(2)}`;
        
        const removeCell = row.insertCell(4);
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'danger-btn';
        removeBtn.onclick = () => removeFromSale(index);
        removeCell.appendChild(removeBtn);
        
        currentSale.subtotal += item.subtotal;
    });
    
    // Apply discount
    if (currentSale.discount) {
        if (currentSale.discount.type === 'percentage') {
            currentSale.discountAmount = (currentSale.subtotal * currentSale.discount.value) / 100;
        } else {
            currentSale.discountAmount = currentSale.discount.value;
        }
    } else {
        currentSale.discountAmount = 0;
    }
    
    currentSale.total = currentSale.subtotal - currentSale.discountAmount;
    
    document.getElementById('saleSubtotal').textContent = `Ksh.${currentSale.subtotal.toFixed(2)}`;
    document.getElementById('saleDiscount').textContent = `Ksh.${currentSale.discountAmount.toFixed(2)}`;
    document.getElementById('saleTotal').textContent = `Ksh.${currentSale.total.toFixed(2)}`;
}

function applyDiscount() {
    const type = document.getElementById('discountType').value;
    const value = parseFloat(document.getElementById('discountValue').value);
    
    if (isNaN(value) || value < 0) {
        alert('Please enter a valid discount value');
        return;
    }
    
    currentSale.discount = { type, value };
    updateSaleDisplay();
}

function clearDiscount() {
    currentSale.discount = null;
    document.getElementById('discountValue').value = '';
    updateSaleDisplay();
}

async function completeSale() {
    if (currentSale.items.length === 0) {
        alert('Please add items to the sale');
        return;
    }
    
    const paymentMode = document.getElementById('paymentMode').value;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    
    try {
        // Get next receipt number
        const { data: counter, error: counterError } = await supabase
            .from('receipt_counter')
            .select('counter')
            .single();
        
        if (counterError) throw counterError;
        
        const receiptNumber = `RCP${String(counter.counter).padStart(6, '0')}`;
        
        // Update product stock
        for (const item of currentSale.items) {
            if (item.type === 'product') {
                const product = products.find(p => p.id === item.id);
                const newStock = product.stock - item.quantity;
                
                const { error: stockError } = await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', item.id);
                
                if (stockError) throw stockError;
            }
        }
        
        // Create transaction
        const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
                worker_id: currentUser.id,
                receipt_number: receiptNumber,
                items: currentSale.items,
                subtotal: currentSale.subtotal,
                discount: currentSale.discount,
                discount_amount: currentSale.discountAmount,
                total: currentSale.total,
                payment_mode: paymentMode,
                customer: customerName || customerPhone ? {
                    name: customerName,
                    phone: customerPhone
                } : null
            });
        
        if (transactionError) throw transactionError;
        
        // Increment receipt counter
        const { error: incrementError } = await supabase
            .from('receipt_counter')
            .update({ counter: counter.counter + 1 })
            .eq('id', 1);
        
        if (incrementError) throw incrementError;
        
        // Print receipt
        printReceipt(receiptNumber, paymentMode, customerName, customerPhone);
        
        // Clear sale
        currentSale = { items: [], subtotal: 0, discount: null, discountAmount: 0, total: 0 };
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('discountValue').value = '';
        updateSaleDisplay();
        
        await loadWorkerProducts();
        alert('Sale completed successfully!');
        
    } catch (error) {
        console.error('Error completing sale:', error);
        alert('Error completing sale: ' + error.message);
    }
}

function printReceipt(receiptNumber, paymentMode, customerName, customerPhone) {
    const receiptWindow = window.open('', '_blank');
    
    let receiptHTML = `
        <html>
        <head>
            <title>Receipt ${receiptNumber}</title>
            <style>
                body { font-family: monospace; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .items { margin: 20px 0; }
                .total { margin-top: 20px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>POS SYSTEM</h2>
                <p>Receipt: ${receiptNumber}</p>
                <p>Date: ${new Date().toLocaleString()}</p>
                <p>Worker: ${currentUser.username}</p>
                ${customerName || customerPhone ? `<p>Customer: ${customerName} ${customerPhone}</p>` : ''}
            </div>
            <hr>
            <div class="items">
                <table width="100%">
    `;
    
    currentSale.items.forEach(item => {
        receiptHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.type === 'product' ? 'x' + item.quantity : ''}</td>
                <td align="right">Ksh.${item.subtotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    receiptHTML += `
                </table>
            </div>
            <hr>
            <div class="total">
                <p>Subtotal: Ksh.${currentSale.subtotal.toFixed(2)}</p>
                ${currentSale.discountAmount > 0 ? `<p>Discount: -Ksh.${currentSale.discountAmount.toFixed(2)}</p>` : ''}
                <p>TOTAL: Ksh.${currentSale.total.toFixed(2)}</p>
                <p>Payment: ${paymentMode}</p>
            </div>
            <div class="header">
                <p>Thank you for your business!</p>
            </div>
        </body>
        </html>
    `;
    
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    receiptWindow.print();
}

// ============= EXPENDITURE MANAGEMENT =============

async function addExpenditure() {
    const category = document.getElementById('expenditureCategory').value;
    const amount = parseFloat(document.getElementById('expenditureAmount').value);
    const description = document.getElementById('expenditureDescription').value;
    
    if (!category || isNaN(amount) || !description) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('expenditures')
            .insert({
                worker_id: currentUser.id,
                category: category,
                amount: amount,
                description: description
            });
        
        if (error) throw error;
        
        document.getElementById('expenditureCategory').value = '';
        document.getElementById('expenditureAmount').value = '';
        document.getElementById('expenditureDescription').value = '';
        
        await loadExpenditures();
        alert('Expenditure added successfully');
    } catch (error) {
        console.error('Error adding expenditure:', error);
        alert('Error adding expenditure: ' + error.message);
    }
}

async function loadExpenditures() {
    try {
        const { data, error } = await supabase
            .from('expenditures')
            .select('*')
            .eq('worker_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const table = document.getElementById('expenditureTable');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        data.forEach(expenditure => {
            const row = table.insertRow();
            row.insertCell(0).textContent = new Date(expenditure.expenditure_date).toLocaleDateString();
            row.insertCell(1).textContent = expenditure.category;
            row.insertCell(2).textContent = expenditure.description;
            row.insertCell(3).textContent = `Ksh.${parseFloat(expenditure.amount).toFixed(2)}`;
        });
    } catch (error) {
        console.error('Error loading expenditures:', error);
    }
}

// ============= SUBMISSION MANAGEMENT =============

async function addSubmission() {
    const amount = parseFloat(document.getElementById('submissionAmount').value);
    const description = document.getElementById('submissionDescription').value;
    
    if (isNaN(amount) || !description) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('submissions')
            .insert({
                worker_id: currentUser.id,
                amount: amount,
                description: description,
                status: 'pending'
            });
        
        if (error) throw error;
        
        document.getElementById('submissionAmount').value = '';
        document.getElementById('submissionDescription').value = '';
        
        await loadSubmissions();
        alert('Submission sent for approval');
    } catch (error) {
        console.error('Error adding submission:', error);
        alert('Error adding submission: ' + error.message);
    }
}

async function loadSubmissions() {
    try {
        const query = userRole === 'admin' 
            ? supabase.from('submissions').select('*, profiles(username)').order('created_at', { ascending: false })
            : supabase.from('submissions').select('*').eq('worker_id', currentUser.id).order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const table = document.getElementById('submissionTable');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        data.forEach(submission => {
            const row = table.insertRow();
            row.insertCell(0).textContent = new Date(submission.submission_date).toLocaleDateString();
            
            if (userRole === 'admin') {
                row.insertCell(1).textContent = submission.profiles?.username || 'Unknown';
            }
            
            const offset = userRole === 'admin' ? 1 : 0;
            row.insertCell(1 + offset).textContent = submission.description;
            row.insertCell(2 + offset).textContent = `Ksh.${parseFloat(submission.amount).toFixed(2)}`;
            
            const statusCell = row.insertCell(3 + offset);
            statusCell.textContent = submission.status.toUpperCase();
            statusCell.className = `status-${submission.status}`;
            
            if (userRole === 'admin' && submission.status === 'pending') {
                const actionsCell = row.insertCell(4 + offset);
                
                const approveBtn = document.createElement('button');
                approveBtn.textContent = 'Approve';
                approveBtn.className = 'success-btn';
                approveBtn.onclick = () => updateSubmissionStatus(submission.id, 'approved');
                actionsCell.appendChild(approveBtn);
                
                const rejectBtn = document.createElement('button');
                rejectBtn.textContent = 'Reject';
                rejectBtn.className = 'danger-btn';
                rejectBtn.onclick = () => updateSubmissionStatus(submission.id, 'rejected');
                actionsCell.appendChild(rejectBtn);
            }
        });
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

async function updateSubmissionStatus(submissionId, status) {
    try {
        const updateData = { 
            status: status,
            [`${status}_by`]: currentUser.id,
            [`${status}_at`]: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('submissions')
            .update(updateData)
            .eq('id', submissionId);
        
        if (error) throw error;
        
        await loadSubmissions();
        alert(`Submission ${status} successfully`);
    } catch (error) {
        console.error('Error updating submission:', error);
        alert('Error updating submission');
    }
}

// ============= SHIFT MANAGEMENT =============

async function startShift() {
    try {
        // Check if there's already an active shift
        const { data: existing } = await supabase
            .from('worker_shifts')
            .select('*')
            .eq('worker_id', currentUser.id)
            .eq('active', true)
            .single();
        
        if (existing) {
            alert('You already have an active shift');
            return;
        }
        
        const { error } = await supabase
            .from('worker_shifts')
            .insert({
                worker_id: currentUser.id,
                start_time: new Date().toISOString(),
                active: true
            });
        
        if (error) throw error;
        
        updateShiftDisplay();
        alert('Shift started');
    } catch (error) {
        console.error('Error starting shift:', error);
        alert('Error starting shift');
    }
}

async function endShift() {
    try {
        const { data: activeShift } = await supabase
            .from('worker_shifts')
            .select('*')
            .eq('worker_id', currentUser.id)
            .eq('active', true)
            .single();
        
        if (!activeShift) {
            alert('No active shift found');
            return;
        }
        
        const endTime = new Date();
        const startTime = new Date(activeShift.start_time);
        const duration = endTime - startTime;
        
        const { error } = await supabase
            .from('worker_shifts')
            .update({
                end_time: endTime.toISOString(),
                duration: duration,
                active: false
            })
            .eq('id', activeShift.id);
        
        if (error) throw error;
        
        updateShiftDisplay();
        alert('Shift ended. Duration: ' + formatDuration(duration));
    } catch (error) {
        console.error('Error ending shift:', error);
        alert('Error ending shift');
    }
}

async function updateShiftDisplay() {
    try {
        const { data: activeShift } = await supabase
            .from('worker_shifts')
            .select('*')
            .eq('worker_id', currentUser.id)
            .eq('active', true)
            .single();
        
        const shiftStatus = document.getElementById('shiftStatus');
        const startBtn = document.getElementById('startShiftBtn');
        const endBtn = document.getElementById('endShiftBtn');
        
        if (activeShift) {
            const duration = Date.now() - new Date(activeShift.start_time).getTime();
            shiftStatus.textContent = `Active Shift: ${formatDuration(duration)}`;
            startBtn.disabled = true;
            endBtn.disabled = false;
        } else {
            shiftStatus.textContent = 'No Active Shift';
            startBtn.disabled = false;
            endBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error updating shift display:', error);
    }
}

function formatDuration(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}

// ============= REPORTING =============

async function loadDashboard() {
    try {
        // Load transactions
        const { data: transactions } = await supabase
            .from('transactions')
            .select('total, created_at');
        
        const totalSales = (transactions || []).reduce((sum, t) => sum + parseFloat(t.total), 0);
        document.getElementById('totalSales').textContent = `Ksh.${totalSales.toFixed(2)}`;
        
        // Load expenditures
        const { data: expenditures } = await supabase
            .from('expenditures')
            .select('amount');
        
        const totalExpenses = (expenditures || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);
        document.getElementById('totalExpenses').textContent = `Ksh.${totalExpenses.toFixed(2)}`;
        
        // Calculate profit
        const profit = totalSales - totalExpenses;
        document.getElementById('totalProfit').textContent = `Ksh.${profit.toFixed(2)}`;
        
        // Load product count
        const { data: products } = await supabase
            .from('products')
            .select('id');
        
        document.getElementById('totalProducts').textContent = (products || []).length;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ============= UTILITY FUNCTIONS =============

function formatCurrency(amount) {
    return `Ksh.${parseFloat(amount).toFixed(2)}`;
}

// Initialize shift display on load for workers
if (userRole === 'worker') {
    updateShiftDisplay();
    // Update shift timer every minute
    setInterval(updateShiftDisplay, 60000);
}
