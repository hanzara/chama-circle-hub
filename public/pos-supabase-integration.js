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

// Placeholder for other functions - to be continued...
// These would include: transactions, expenditures, submissions, shifts, receipts, etc.
