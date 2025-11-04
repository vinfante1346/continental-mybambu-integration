/**
 * Continental Assist API - Complete Purchase Flow Example
 *
 * This example demonstrates a complete voucher purchase workflow
 * using the Continental Assist API with My Bambu integration.
 */

const BASE_URL = process.env.CA_BASE_URL || 'https://api-eva.continentalassist.com/api';
const TOKEN = process.env.CA_TOKEN;

/**
 * Main purchase flow function
 */
async function completePurchaseFlow() {
  console.log('🚀 Starting Continental Assist Purchase Flow...\n');

  try {
    // Step 1: Get Available Categories
    console.log('📋 Step 1: Fetching plan categories...');
    const categories = await getCategories();
    console.log(`✅ Found ${categories.cantidad} categories`);
    categories.resultado.forEach(cat => {
      console.log(`   - ${cat.categoria} (ID: ${cat.id_categoria})`);
    });
    console.log('');

    // Step 2: Get Origin Countries
    console.log('🌍 Step 2: Fetching origin countries...');
    const origins = await getOrigins();
    console.log(`✅ Found ${origins.cantidad} origin countries`);
    console.log('');

    // Step 3: Get Destinations
    console.log('🗺️  Step 3: Fetching destinations...');
    const destinations = await getDestinations();
    console.log(`✅ Found ${destinations.cantidad} destinations`);
    console.log('');

    // Step 4: Get Plans and Pricing
    console.log('💰 Step 4: Fetching available plans...');
    const travelDetails = {
      dias: 7,
      edades: [30, 35],
      id_categoria: categories.resultado[0].id_categoria,
      id_destino: destinations.resultado[0].id_destino || 1,
      familiar: false
    };

    const plans = await getPlans(travelDetails);
    console.log(`✅ Found ${plans.cantidad} available plans`);
    plans.resultado.forEach(plan => {
      console.log(`   - ${plan.nombre}: $${plan.precio_grupal} ${plan.moneda}`);
    });
    console.log('');

    // Step 5: Validate Coupon (Optional)
    console.log('🎟️  Step 5: Validating coupon (optional)...');
    // Skip if no coupon
    console.log('⏭️  Skipped - no coupon provided\n');

    // Step 6: Get Additional Benefits
    console.log('✨ Step 6: Fetching additional benefits...');
    const benefits = await getAdditionalBenefits(
      plans.resultado[0].id,
      travelDetails.id_categoria,
      travelDetails.dias
    );
    if (benefits.cantidad > 0) {
      console.log(`✅ Found ${benefits.cantidad} additional benefits`);
      benefits.resultado.forEach(benefit => {
        console.log(`   - ${benefit.beneficio}: $${benefit.precioaddon}`);
      });
    } else {
      console.log('ℹ️  No additional benefits available');
    }
    console.log('');

    // Step 7: Purchase Voucher
    console.log('🛒 Step 7: Purchasing voucher...');
    const purchaseData = {
      origen: 'CO',
      destino: travelDetails.id_destino,
      desde: '01/03/2025',
      hasta: '08/03/2025',
      id_categoria: travelDetails.id_categoria,
      id_plan: plans.resultado[0].id,
      contacto: {
        nombre: 'John Emergency Contact',
        telefono: '+573001234567',
        email: 'emergency@example.com'
      },
      beneficiarios: [
        {
          nombre: 'Maria',
          apellido: 'Garcia',
          fecha_nac: '15/05/1990',
          edad: 34,
          documento: 'CC123456789',
          email: 'maria.garcia@example.com',
          telefono: '+573001234567'
        },
        {
          nombre: 'Carlos',
          apellido: 'Garcia',
          fecha_nac: '22/08/1988',
          edad: 36,
          documento: 'CC987654321',
          email: 'carlos.garcia@example.com',
          telefono: '+573009876543'
        }
      ],
      ip: '192.168.1.100',
      forma_pago: 1,
      familiar: false,
      totalgeneral: plans.resultado[0].precio_grupal,
      beneficios_adicionales: []
    };

    const purchase = await purchaseVoucher(purchaseData);
    console.log('✅ Voucher purchased successfully!');
    console.log(`   Voucher Code: ${purchase.resultado[0].codigo}`);
    console.log(`   Total Price: $${purchase.resultado[0].precio_total}`);
    console.log(`   Link: ${purchase.resultado[0].link_voucher}`);
    console.log('');

    // Step 8: Retrieve Voucher Details
    console.log('📄 Step 8: Retrieving voucher details...');
    const voucherDetails = await getVoucherDetails(
      purchase.resultado[0].codigo,
      'spa'
    );
    console.log('✅ Voucher details retrieved');
    console.log(`   Status: ${voucherDetails.resultado[0].status}`);
    console.log(`   Origin: ${voucherDetails.resultado[0].origen}`);
    console.log(`   Destination: ${voucherDetails.resultado[0].destino}`);
    console.log(`   Beneficiaries: ${voucherDetails.resultado[0].cantidad_beneficiarios}`);
    console.log('');

    console.log('🎉 Purchase flow completed successfully!\n');
    return purchase.resultado[0];

  } catch (error) {
    console.error('❌ Error in purchase flow:', error.message);
    throw error;
  }
}

/**
 * Get available plan categories
 */
async function getCategories() {
  const response = await fetch(`${BASE_URL}/consulta_categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({ language_id: 'spa' })
  });

  return handleResponse(response);
}

/**
 * Get origin countries
 */
async function getOrigins() {
  const response = await fetch(`${BASE_URL}/consulta_origenes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({})
  });

  return handleResponse(response);
}

/**
 * Get destination countries
 */
async function getDestinations() {
  const response = await fetch(`${BASE_URL}/consulta_destinos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({})
  });

  return handleResponse(response);
}

/**
 * Get available plans with pricing
 */
async function getPlans(travelDetails) {
  const response = await fetch(`${BASE_URL}/consulta_planes_grupal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify(travelDetails)
  });

  return handleResponse(response);
}

/**
 * Validate discount coupon
 */
async function validateCoupon(couponCode) {
  const response = await fetch(`${BASE_URL}/consulta_cupon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({ cupon: couponCode })
  });

  return handleResponse(response);
}

/**
 * Get additional benefits for a plan
 */
async function getAdditionalBenefits(planId, categoryId, dias) {
  const response = await fetch(`${BASE_URL}/consulta_beneficios_adicionales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({
      id_plan: planId,
      id_categoria: categoryId,
      dias: dias
    })
  });

  const data = await handleResponse(response);

  // Handle case where plan has no additional benefits
  if (data.error === true) {
    return { resultado: [], cantidad: 0, error: false };
  }

  return data;
}

/**
 * Purchase voucher
 */
async function purchaseVoucher(purchaseData) {
  const response = await fetch(`${BASE_URL}/comprar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify(purchaseData)
  });

  return handleResponse(response);
}

/**
 * Get voucher details
 */
async function getVoucherDetails(voucherCode, language = 'spa') {
  const response = await fetch(`${BASE_URL}/consulta_voucher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'EVA-AUTH-USER': TOKEN
    },
    body: JSON.stringify({
      language_id: language,
      codigo: voucherCode
    })
  });

  return handleResponse(response);
}

/**
 * Handle API response
 */
async function handleResponse(response) {
  const data = await response.json();

  // Check HTTP status
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed - check your API token');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Check application errors
  if (data.error === true || data.error === 401) {
    const errorMsg = Array.isArray(data.resultado)
      ? data.resultado[0]?.mensaje_error || 'API Error'
      : data.resultado || 'Unknown Error';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Calculate price with coupon discount
 */
function calculatePriceWithCoupon(originalPrice, discountPercentage) {
  return (originalPrice * (1 - discountPercentage / 100)).toFixed(2);
}

// Export functions for use in other modules
module.exports = {
  completePurchaseFlow,
  getCategories,
  getOrigins,
  getDestinations,
  getPlans,
  validateCoupon,
  getAdditionalBenefits,
  purchaseVoucher,
  getVoucherDetails,
  calculatePriceWithCoupon
};

// Run if executed directly
if (require.main === module) {
  completePurchaseFlow()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
