import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('factory_applications').insert([{
    is_dropshipping: true,
    company_name: 'Test',
    manager_email: 'test@test.com',
    phone: '010-1234-5678',
    main_category: 'fashion',
    product_image_url: 'http://test.com',
    consumer_price: 1000,
    supply_price: 500,
    status: 'pending',
    agree_notification: true
  }]);
  console.log('Factory Insert Error:', error);
}
test();
