import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { defaultConfig } from './config.ts'

const config = defaultConfig

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with anon key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the request body
    const { query, params = [] } = await req.json()

    // Validate query
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid query' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check query length
    if (query.length > config.safety.maxQueryLength) {
      return new Response(
        JSON.stringify({ error: 'Query too long' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for blocked patterns
    const hasBlockedPattern = config.safety.blockedPatterns.some(pattern => 
      query.toUpperCase().includes(pattern.toUpperCase())
    )
    if (hasBlockedPattern) {
      return new Response(
        JSON.stringify({ error: 'Query contains blocked patterns' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for allowed operations
    const operation = query.trim().split(' ')[0].toUpperCase()
    if (!config.safety.allowedOperations.includes(operation)) {
      return new Response(
        JSON.stringify({ error: 'Operation not allowed' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Execute the query
    const { data, error } = await supabaseClient.rpc('execute_sql', {
      query_text: query,
      params: params
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 