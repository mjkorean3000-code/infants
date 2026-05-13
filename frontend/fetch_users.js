import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://joointthbcwtntvqjaxr.supabase.co';
const supabaseKey = 'sb_publishable_WqaSHwNY0QHigLNmXPfGTQ_EeNiXm1v';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching influencers...');
  const { data: influencers, error: infError } = await supabase.from('influencers').select('*');
  if (infError) {
    console.error('Error fetching influencers:', infError);
  } else {
    console.log('Influencers:');
    influencers.forEach(inf => {
      console.log(`ID: ${inf.instagram_id}, Email: ${inf.email}, Status: ${inf.status}, Password: ${inf.password}`);
    });
  }
}

main();
