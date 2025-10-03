const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vhdkhtrczpctcubudqwh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZGtodHJjenBjdGN1YnVkcXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgyNDIwNCwiZXhwIjoyMDcyNDAwMjA0fQ.P1BTElAIu_lusbweajnhxOsKlzSdI6L0RvPvttyinc8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('Setting up Supabase Storage for speaker photos...')

  try {
    // Create the bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('speaker-photos', {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✓ Bucket already exists')
      } else {
        console.error('Error creating bucket:', bucketError)
        return
      }
    } else {
      console.log('✓ Bucket created successfully')
    }

    console.log('\n✅ Storage setup complete!')
    console.log('You can now upload speaker photos from the admin dashboard.')

  } catch (error) {
    console.error('Error:', error)
  }
}

setupStorage()
