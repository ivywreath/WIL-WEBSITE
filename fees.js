// Error handling and form validation for Empowering the Nation course calculator
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const courseForm = document.getElementById('courseForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const calculateButton = document.getElementById('calculateButton');
    const quoteElement = document.getElementById('quote');
    
    // Check if all required elements exist
    if (!courseForm || !nameInput || !phoneInput || !emailInput || !calculateButton || !quoteElement) {
        console.error('Error: Required HTML elements not found. Check your form structure and IDs.');
        // Create an alert to notify the developer/user
        if (document.body) {
            const errorAlert = document.createElement('div');
            errorAlert.style.backgroundColor = '#f44336';
            errorAlert.style.color = 'white';
            errorAlert.style.padding = '20px';
            errorAlert.style.margin = '20px';
            errorAlert.style.borderRadius = '5px';
            errorAlert.innerHTML = '<strong>Error:</strong> Required form elements not found. Please check console for details.';
            document.body.prepend(errorAlert);
        }
        return; // Exit the function to prevent further errors
    }
    
    // Create error message container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    courseForm.insertBefore(errorContainer, calculateButton);
    
    // Course selections will be stored in this array
    let selectedCourses = [];
    
    // Add event listeners for form validation
    nameInput.addEventListener('blur', validateName);
    phoneInput.addEventListener('blur', validatePhone);
    emailInput.addEventListener('blur', validateEmail);
    calculateButton.addEventListener('click', validateAndCalculate);
    
    // Add input event listeners to clear errors when user starts typing
    nameInput.addEventListener('input', clearError);
    phoneInput.addEventListener('input', clearError);
    emailInput.addEventListener('input', clearError);
    
    // Validation functions
    function validateName() {
        const name = nameInput.value.trim();
        if (name === '') {
            showError(nameInput, 'Please enter your name');
            return false;
        } else if (name.length < 2) {
            showError(nameInput, 'Name must be at least 2 characters');
            return false;
        } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            showError(nameInput, 'Name should contain only letters, spaces, hyphens and apostrophes');
            return false;
        }
        removeError(nameInput);
        return true;
    }
    
    function validatePhone() {
        const phone = phoneInput.value.trim();
        // South African phone number format
        const phoneRegex = /^(\+27|0)[0-9]{9}$/;
        
        if (phone === '') {
            showError(phoneInput, 'Please enter your phone number');
            return false;
        } else if (!phoneRegex.test(phone)) {
            showError(phoneInput, 'Please enter a valid South African phone number (e.g., 0123456789 or +27123456789)');
            return false;
        }
        removeError(phoneInput);
        return true;
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            showError(emailInput, 'Please enter your email address');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(emailInput, 'Please enter a valid email address');
            return false;
        }
        removeError(emailInput);
        return true;
    }
    
    function validateCourseSelection() {
        const checkboxes = document.querySelectorAll('input[name="course"]:checked');
        if (checkboxes.length === 0) {
            showGeneralError('Please select at least one course');
            return false;
        }
        clearGeneralErrors();
        return true;
    }
    
    function validateAndCalculate() {
        // Clear all previous errors
        clearAllErrors();
        
        // Validate all fields
        const isNameValid = validateName();
        const isPhoneValid = validatePhone();
        const isEmailValid = validateEmail();
        const isCoursesValid = validateCourseSelection();
        
        // If all validations pass, calculate the total
        if (isNameValid && isPhoneValid && isEmailValid && isCoursesValid) {
            try {
                calculateTotal();
                // Save form data to localStorage for possible future use
                saveFormData();
            } catch (error) {
                showGeneralError('An error occurred while calculating the total: ' + error.message);
                console.error('Calculation error:', error);
            }
        } else {
            // Scroll to the first error
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    function saveFormData() {
        // Store form data in localStorage
        try {
            const formData = {
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                email: emailInput.value.trim(),
                selectedCourses: selectedCourses
            };
            localStorage.setItem('courseFormData', JSON.stringify(formData));
        } catch (error) {
            console.warn('Could not save form data:', error);
            // Non-critical error, no need to notify the user
        }
    }
    
    function calculateTotal() {
        // Get all selected courses
        const selectedCheckboxes = document.querySelectorAll('input[name="course"]:checked');
        
        // Verify that we have selected courses
        if (selectedCheckboxes.length === 0) {
            throw new Error('No courses selected');
        }
        
        // Clear the selected courses array
        selectedCourses = [];
        
        // Calculate subtotal and populate selectedCourses array
        let subtotal = 0;
        selectedCheckboxes.forEach(checkbox => {
            const courseName = checkbox.nextElementSibling.textContent.split(' (')[0];
            const coursePrice = parseFloat(checkbox.value);
            
            // Validate the course price
            if (isNaN(coursePrice)) {
                throw new Error(`Invalid price for course: ${courseName}`);
            }
            
            subtotal += coursePrice;
            selectedCourses.push({
                name: courseName,
                price: coursePrice
            });
        });
        
        // Apply discount based on number of courses
        let discountPercentage = 0;
        let discountAmount = 0;
        
        if (selectedCourses.length === 2) {
            discountPercentage = 5;
        } else if (selectedCourses.length === 3) {
            discountPercentage = 10;
        } else if (selectedCourses.length > 3) {
            discountPercentage = 15;
        }
        
        if (discountPercentage > 0) {
            discountAmount = subtotal * (discountPercentage / 100);
        }
        
        // Calculate the amount after discount
        const afterDiscount = subtotal - discountAmount;
        
        // Add VAT (15%)
        const vat = afterDiscount * 0.15;
        
        // Calculate total
        const total = afterDiscount + vat;
        
        // Update the quote text with more detailed breakdown
        quoteElement.innerHTML = `
            <div class="quote-header">Total Fee (Quote): R${total.toFixed(2)}</div>
            <div class="quote-details">
                <table class="quote-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td>R${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Discount (${discountPercentage}%):</td>
                        <td>-R${discountAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Amount after discount:</td>
                        <td>R${afterDiscount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>VAT (15%):</td>
                        <td>R${vat.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        `;
        
        // Show success message
        showSuccessMessage('Your quote has been calculated successfully!');
        
        // Return the selected courses array for further use
        return selectedCourses;
    }
    
    // Error handling functions
    function showError(inputElement, message) {
        // Remove any existing error for this element
        removeError(inputElement);
        
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error';
        errorMessage.textContent = message;
        
        // Add error styling to the input
        inputElement.classList.add('input-error');
        
        // Insert error after the input
        inputElement.parentNode.insertBefore(errorMessage, inputElement.nextSibling);
    }
    
    function removeError(inputElement) {
        // Remove error styling
        inputElement.classList.remove('input-error');
        
        // Remove error message if it exists
        const nextSibling = inputElement.nextSibling;
        if (nextSibling && nextSibling.className === 'error') {
            nextSibling.remove();
        }
    }
    
    function showGeneralError(message) {
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error general-error';
        errorMessage.textContent = message;
        
        // Add to error container
        errorContainer.appendChild(errorMessage);
    }
    
    function clearGeneralErrors() {
        // Remove all general errors
        const generalErrors = errorContainer.querySelectorAll('.general-error');
        generalErrors.forEach(error => error.remove());
    }
    
    function clearError() {
        // Clear error when user starts typing
        removeError(this);
    }
    
    function clearAllErrors() {
        // Clear all errors
        const errors = document.querySelectorAll('.error');
        errors.forEach(error => error.remove());
        
        // Remove error styling from all inputs
        const errorInputs = document.querySelectorAll('.input-error');
        errorInputs.forEach(input => input.classList.remove('input-error'));
        
        // Clear success messages too
        const successMessages = document.querySelectorAll('.success-message');
        successMessages.forEach(msg => msg.remove());
    }
    
    function showSuccessMessage(message) {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;

    // Add to error container
    errorContainer.appendChild(successMessage);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

    
    // Exception handling for the entire form
    window.addEventListener('error', function(event) {
        console.error('Global error caught:', event.error);
        showGeneralError('An unexpected error occurred. Please try again or contact support.');
        return false; // Prevents the default browser error handling
    });
    
    // Handle form submission to prevent page reload
    courseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        validateAndCalculate();
    });
    
    // Try to load any saved form data
    try {
        const savedData = localStorage.getItem('courseFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            // Only auto-fill if fields are empty (don't overwrite user input)
            if (nameInput.value === '') nameInput.value = formData.name || '';
            if (phoneInput.value === '') phoneInput.value = formData.phone || '';
            if (emailInput.value === '') emailInput.value = formData.email || '';
            
            // Don't auto-select courses to avoid confusion
        }
    } catch (error) {
        console.warn('Could not load saved form data:', error);
        // Non-critical error, no need to notify the user
    }
    
    // Add CSS for the quote table
    const style = document.createElement('style');
    style.textContent = `
        .quote-header {
            font-weight: bold;
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #18375D;
        }
        .quote-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .quote-table td {
            padding: 5px;
            text-align: left;
        }
        .quote-table td:last-child {
            text-align: right;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);

    
});
