-- Create a function to execute SQL queries safely
CREATE OR REPLACE FUNCTION execute_sql(
  query text,
  params jsonb DEFAULT '[]'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Execute the query with parameters and capture results
  EXECUTE query INTO result USING params;
  
  -- Return the result
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL execution error: %', SQLERRM;
END;
$$; 