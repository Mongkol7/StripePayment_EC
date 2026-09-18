document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amountInput');
    const presetButtons = document.querySelectorAll('.btn-preset');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const paymentForm = document.getElementById('paymentForm');
    const payButton = document.getElementById('payButton');
    const buttonSpinner = document.getElementById('buttonSpinner');
    const buttonText = document.getElementById('buttonText');
    const toastBox = document.getElementById('toastBox');

    // Preset Amount Click Handler
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = parseFloat(btn.dataset.amount).toFixed(2);
            amountInput.value = val;
            updateSummary(val);
        });
    });

    // Custom Amount Input Handler
    amountInput.addEventListener('input', (e) => {
        presetButtons.forEach(b => b.classList.remove('active'));
        const val = parseFloat(e.target.value) || 0;
        updateSummary(val.toFixed(2));
    });

    function updateSummary(val) {
        const num = parseFloat(val) || 0;
        const formatted = '$' + num.toFixed(2);
        if (summarySubtotal) summarySubtotal.textContent = formatted;
        if (summaryTotal) summaryTotal.textContent = formatted;
        if (buttonText) buttonText.textContent = `Pay ${formatted} with Stripe`;
    }

    // Payment Form Submit Handler
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const amount = parseFloat(amountInput.value);
        const customerName = document.getElementById('customerName').value.trim();
        const customerEmail = document.getElementById('customerEmail').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!amount || amount < 0.50) {
            showToast('Minimum payment amount is $0.50 USD.', true);
            amountInput.focus();
            return;
        }

        if (!customerName) {
            showToast('Please enter your full name.', true);
            return;
        }

        if (!customerEmail || !customerEmail.includes('@')) {
            showToast('Please enter a valid email address.', true);
            return;
        }

        setLoading(true);

        const payload = {
            amount: amount,
            currency: 'USD',
            customerName: customerName,
            customerEmail: customerEmail,
            description: description || 'Payment via Stripe Checkout'
        };

        try {
            const response = await fetch('/api/v1/payments/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to initiate Stripe checkout');
            }

            if (data.checkoutUrl) {
                // Save order ref for local state if needed
                sessionStorage.setItem('lastOrderRef', data.orderReference);
                // Redirect user to Stripe's hosted checkout page
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL returned from payment gateway');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            showToast(error.message || 'Unable to connect to Stripe service.', true);
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        payButton.disabled = isLoading;
        if (isLoading) {
            buttonSpinner.style.display = 'inline-block';
            buttonText.textContent = 'Redirecting to Stripe...';
        } else {
            buttonSpinner.style.display = 'none';
            const num = parseFloat(amountInput.value) || 10;
            buttonText.textContent = `Pay $${num.toFixed(2)} with Stripe`;
        }
    }

    function showToast(message, isError = false) {
        if (!toastBox) return;
        toastBox.textContent = message;
        toastBox.className = 'toast-box' + (isError ? ' toast-error' : '');
        toastBox.style.display = 'flex';

        setTimeout(() => {
            toastBox.style.display = 'none';
        }, 4500);
    }

    // Initial summary calculation
    updateSummary(amountInput.value);
});
