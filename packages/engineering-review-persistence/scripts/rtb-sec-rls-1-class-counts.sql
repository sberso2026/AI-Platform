SELECT classification, count(*) AS n
FROM public.rtb_public_table_security_classification
GROUP BY classification
ORDER BY classification;
