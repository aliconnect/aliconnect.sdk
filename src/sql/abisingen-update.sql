USE abisingen
GO
DISABLE TRIGGER ALL ON abisingen.dbo.orderRegels;
GO
-- UPDATE orderRegels
-- SET orderRegels.purchaseOrderId = tblBon.uid
-- FROM dbo.tblBon
-- WHERE orderRegels.bonId = tblBon.id
-- AND orderRegels.purchaseOrderId IS NULL
-- GO
UPDATE orderRegels
SET orderRegels.saleItemId = tblArtikel.guid
FROM dbo.tblArtikel
WHERE orderRegels.artid = tblArtikel.artid
AND orderRegels.saleItemId IS NULL AND orderRegels.artid IS NOT NULL
GO
ENABLE TRIGGER ALL ON abisingen.dbo.orderRegels;
GO
DISABLE TRIGGER ALL On tblArtikel; 
GO
UPDATE tblArtikel SET categorie = '[]';
UPDATE tblArtikel SET categorie = JSON_ARRAY(JSON_MODIFY(categorie,'$.name','Mike')

GO
ENABLE TRIGGER ALL On tblArtikel; 
GO

PRINT JSON_VALUE('[1,2]', '$[1]')

