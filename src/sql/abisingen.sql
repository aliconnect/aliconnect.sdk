USE [abisingen]
GO
ALTER PROCEDURE abis1.updateLevBruto 
    @leverancierId BIGINT = NULL
    AS
        with art as (
            select a.artid,a.titel,a.bruto AS oud,i.levBruto AS nieuw,i.levBruto/ISNULL(a.bruto,i.levBruto) AS faktor
            from tblArtikel a
            inner join tblArtInk as i on i.id = a.artInkId
            where
                i.levBruto<>0
				and a.bruto is not null
                and i.leverancierId IN (6138,2325,6159,6169,6299)
        )
        SELECT * 
        FROM art 
        ORDER BY faktor
    GO
    EXEC abis1.updateLevBruto @leverancierId=6138
    GO


ALTER VIEW abis1.company AS
    SELECT
        uid AS id
        ,dbname AS dbname
        ,id AS companyId
        ,supplier_id AS supplierId
        ,kleurId AS colorId
        ,zoek AS keyname
        ,zoek AS keyword
        ,files AS files
        ,logoUrl AS logoUrl
        ,invoiceSenderMailAddress AS invoiceSenderMailAddress
        ,categories AS categories
        ,createdDateTime AS createdDateTime
        ,lastModifiedDateTime AS lastModifiedDateTime
        ,startDateTime AS startDateTime
        ,endDateTime AS endDateTime
        ,finishedDateTime AS finishedDateTime
        ,firma AS companyName
        ,website AS businessHomePage
        ,telefoon AS businessPhone
        ,fax AS businessFax
        ,mobiel AS businessMobilePhone
        ,[extra 1] AS businessEmailAdres
        ,[extra 1] AS emailAddress0
        ,[extra 2] AS emailAddress1
        ,NULL AS otherTelephoneNumber
        ,businessAddress AS businessAddress
        ,otherAddress AS otherAddress
        ,bank AS iban
        ,bic AS bic
        ,debNr AS debNummer
        ,kvk AS organizationalIDNumber
        ,btwNummer AS btwNummer
        ,btw AS btwTarief
    FROM
        abisingen.dbo.tblOrganisatie
    GO
ALTER VIEW abis1.ppgItem AS
    SELECT
        id AS id
        ,code AS code
        ,description AS description
        ,startingDate AS startingDate
        ,organisatieId AS organisatieId
        ,artId AS saleItemId
    FROM
        abisingen.dbo.tblArtKlantPpg
    GO
ALTER VIEW abis1.product AS
    SELECT 
        -- ISNULL(artInk.uid,art.guid) AS id
        prod.guid AS id
        --artInk.uid AS id
        ,prod.artId AS productId
        ,prod.titel AS description
        ,prod.inkbruto AS listprice
        ,prod.categorie AS categories
        ,prod.barcode AS ean
        ,prod.code AS code
        ,prod.merk AS brand
        ,prod.iconUrl AS iconUrl
        ,prod.deletedDateTime AS deletedDateTime
        ,prod.unNr AS unNr
        ,prod.unCat AS unCat
        ,prod.gewicht AS weight
        ,prod.magLokatie AS storageLocation
        ,prod.vos AS vos
        ,prod.LaatstVerkochtDatumTijd AS lastSaleDateTime
    FROM 
        abisingen.dbo.tblArtikel AS prod
        --INNER JOIN abisingen.dbo.tblArtInk AS artInk ON artInk.id = art.artInkId
    WHERE
        prod.artId IN (SELECT prodId FROM abisingen.dbo.tblArtikel)
    UNION ALL
    SELECT
        prod.uid AS id
        ,NULL AS productId
        ,prod.tekst AS description
        ,prod.levbruto AS listprice
        ,NULL AS categories
        ,prod.barcode AS ean
        ,prod.code AS code
        ,prod.merk AS brand
        ,NULL AS iconUrl
        ,prod.deletedDateTime AS deletedDateTime
        ,NULL AS unNr
        ,NULL AS unCat
        ,prod.gewicht AS weight
        ,NULL AS storageLocation
        ,NULL AS vos
        ,prod.LaatstVerkochtDatumTijd AS lastSaleDateTime
    FROM 
        abisingen.dbo.tblArtInk AS prod 
    WHERE
        prod.id NOT IN (SELECT artInkId FROM abisingen.dbo.tblArtikel WHERE artInkId IS NOT NULL)
    GO


ALTER VIEW abis1.saleItem AS
    -- Alle artikelen verkocht door proving/airo met/zonder inkoop
    SELECT
        art.guid AS id
        ,art.artId AS saleItemId
        ,prod.guid AS productId
        ,sup.uid AS supplierId
        ,CONVERT(UNIQUEIDENTIFIER,NULL) AS customerId
        ,art.bruto AS listprice
        ,0 AS discount
        ,art.categorie AS categories
        -- ,art.magLokatie AS storageLocation
        ,art.eenheid AS packUnit
        ,art.aantalStuks AS packQuant
        ,art.verpaktPer AS packedPer
        ,art.deletedDateTime AS deletedDateTime
        ,CONVERT(INT,NULL) AS quant
        ,art.LaatstVerkochtDatumTijd AS lastSaleDateTime
    FROM 
        abisingen.dbo.tblArtikel AS art
        INNER JOIN abisingen.dbo.tblArtikel AS prod ON art.prodId = prod.artId
        INNER JOIN abisingen.dbo.tblOrganisatie AS sup ON sup.id = art.bedrijfId
        -- INNER JOIN abisingen.dbo.tblArtInk AS artInk ON artInk.id = art.artInkId
    -- WHERE
    --     art.artInkId IS NOT NULL
        -- AND prod.deletedDateTime IS NULL
        -- AND art.deletedDateTime IS NULL
    UNION ALL
    -- Alle artikelen verkocht door leverancier aan proving/airo
    SELECT
        art.guid AS id
        ,NULL AS saleItemId
        ,prod.guid AS productId
        ,sup.uid AS supplierId
        ,cus.uid AS customerId
        ,artink.levbruto AS listprice
        ,artInk.levKorting AS discount
        ,art.categorie AS categories
        -- ,art.magLokatie AS storageLocation
        ,art.eenheid AS packUnit
        ,art.aantalStuks AS packQuant
        ,art.verpaktPer AS packedPer
        ,art.deletedDateTime AS deletedDateTime
        ,CONVERT(INT,NULL) AS quant
        ,art.LaatstVerkochtDatumTijd AS lastSaleDateTime
    FROM 
        abisingen.dbo.tblArtikel AS art
        INNER JOIN abisingen.dbo.tblArtikel AS prod ON art.prodId = prod.artId
        INNER JOIN abisingen.dbo.tblArtInk AS artInk ON artInk.id = art.artInkId
        INNER JOIN abisingen.dbo.tblOrganisatie AS sup ON sup.id = artInk.leverancierId
        INNER JOIN abisingen.dbo.tblOrganisatie AS cus ON cus.id = art.bedrijfId
    UNION ALL
    -- Alle artikelen verkocht door leverancier niet bekend bij airo/proving
    SELECT
        artInk.uid AS id
        ,NULL AS saleItemId
        ,artInk.uid AS productId
        ,sup.uid AS supplierId
        ,NULL AS customerId
        ,artink.levbruto AS listprice
        ,artInk.levKorting AS discount
        ,NULL AS categories
        -- ,art.magLokatie AS storageLocation
        ,artInk.eenheid AS packUnit
        ,artInk.aantalStuks AS packQuant
        ,artInk.verpaktPer AS packedPer
        ,artInk.deletedDateTime AS deletedDateTime
        ,CONVERT(INT,NULL) AS quant
        ,NULL AS lastSaleDateTime
    FROM 
        abisingen.dbo.tblArtInk AS artInk
        INNER JOIN abisingen.dbo.tblOrganisatie AS sup ON sup.id = artInk.leverancierId
    WHERE
         artInk.id NOT IN (SELECT artInkId FROM abisingen.dbo.tblArtikel WHERE artInkId IS NOT NULL)
    UNION ALL
    -- Alle artikelen verkocht door airo/proving aan specifiek klant
    SELECT 
        artKlant.id AS id
        ,art.artId AS saleItemId
        ,prod.guid AS productId
        ,sup.uid AS supplierId
        ,cus.uid AS customerId
        ,art.bruto AS listprice
        ,artKlant.korting AS discount
        ,prod.categorie AS categories
        -- ,NULL AS storageLocation
        ,art.eenheid AS packUnit
        ,art.aantalStuks AS packQuant
        ,art.verpaktPer AS packedPer
        ,artKlant.deletedDateTime AS deletedDateTime
        ,artKlant.aantal AS quant
        ,artKlant.lastModifiedDateTime AS lastSaleDateTime
    FROM 
        abisingen.dbo.klantArtikelen AS artKlant
        INNER JOIN abisingen.dbo.tblArtikel AS art ON art.artId = artKlant.artId
        INNER JOIN abisingen.dbo.tblArtikel AS prod ON prod.artId = art.prodId
        INNER JOIN abisingen.dbo.tblArtInk AS artInk ON artInk.id = art.artInkId
        INNER JOIN abisingen.dbo.tblOrganisatie AS cus ON cus.id = artKlant.organisatieId
        INNER JOIN abisingen.dbo.tblOrganisatie AS sup ON sup.id = cus.bedrijfId
    WHERE art.deletedDateTime IS NULL
    GO
ALTER VIEW abis1.invoice AS
    SELECT
        uid AS id
        ,id AS invoiceId
        ,files AS files
        ,faktuurNr AS invoiceNr
        ,supplierId AS supplierId
        ,customerId AS customerId
        ,datum AS invoiceDateTime
        ,geboektDt AS bookedDateTime
        ,lastSendDateTime AS lastSendDateTime
        ,saldo AS saldo
        ,totExcl AS listprice
        ,bodyHtml AS bodyHtml
        ,KortContant AS payDiscount    
    FROM
        abisingen.dbo.tblFactuur
    GO
ALTER VIEW abis1.purchaseOrder AS
    SELECT
        uid AS id
        ,id AS purchaseOrderId
        ,supplier_id AS supplierId
        ,customer_id AS customerId
        ,status AS status
        ,categories AS categories
        ,invoiceId AS invoiceId
        ,aanbieding AS isCalc
        ,verwerkt AS isOrdered
        ,lastModifiedDateTime AS lastModifiedDateTime
        ,datum AS createdDateTime
        ,files AS files
        ,datumBesteld AS orderDateTime
        ,datumGeprint AS printDateTime
        ,orderPickDateTime AS pickedDateTime
        ,verstuurdDT AS sendDateTime
        ,gereedDatumTijd AS deliveredDateTime
        ,onholdDateTime AS onholdDateTime
        -- ,bookedDateTime
        -- ,finishedDateTime
        -- ,cancelledDateTime
        ,deletedDateTime AS deletedDateTime
        ,totExcl AS listprice
        ,volgNr AS orderType
        ,routeNr AS transportType
        ,uwRef AS customerReference
    FROM
        abisingen.dbo.tblBon AS PO
    GO
ALTER VIEW abis1.purchaseOrderLine AS
    SELECT
        id AS id
        ,changed AS lastModifiedDateTime
        ,purchaseOrderId AS purchaseOrderId
        ,saleItemId AS saleItemId
        ,customerItemId AS customerItemId
        ,invoiceId AS invoiceId
        ,deletedDateTime AS deletedDateTime
        ,aantal AS quant
        ,korting AS discount
        ,bruto AS listprice
        ,extraTekst AS note
        ,extraTekstIntern AS privateNote
        ,pos AS pos
    FROM
        abisingen.dbo.orderregels
    GO








-- proving1
-- 9295EDFB-1515-4CD8-ACA8-C25D3F7A08E0 id in abisingen
USE [c03f7ac2-c579-421c-b637-0d62d59735b7]
    GO
ALTER PROCEDURE updateAbisIngen AS

    UPDATE abisingen.dbo.tblArtikel 
    SET supplierId = '9295edfb-1515-4cd8-aca8-c25d3f7a08e0' 
    WHERE bedrijf = 'proving' AND deleteddateTime IS NULL

    UPDATE abisingen.dbo.tblArtikel 
    SET supplierId = '078e1398-9849-45e2-b5bd-d1ec001832c5' 
    WHERE bedrijf = 'airo' AND deleteddateTime IS NULL


    UPDATE abisingen.dbo.tblOrganisatie
    SET supplier_id = '9295edfb-1515-4cd8-aca8-c25d3f7a08e0' 
    WHERE bedrijf = 'proving'

    UPDATE abisingen.dbo.tblOrganisatie
    SET supplier_id = '078e1398-9849-45e2-b5bd-d1ec001832c5' 
    WHERE bedrijf = 'airo'

    UPDATE abisingen.dbo.tblBon 
    SET customer_id = company.id, supplier_id = company.supplierId
    FROM dbo.company
    WHERE abisingen.dbo.tblBon.organisatieId = company.companyId
    --AND customer_id IS NULL

    UPDATE abisingen.dbo.klantartikelen
    SET abisingen.dbo.klantartikelen.customerId = company.id
    FROM dbo.company
    WHERE abisingen.dbo.klantartikelen.organisatieId = company.companyId
    AND abisingen.dbo.klantartikelen.customerId IS NULL
    
    UPDATE abisingen.dbo.klantartikelen
    SET abisingen.dbo.klantartikelen.saleItemId = saleItem.id
    FROM dbo.saleItem
    WHERE abisingen.dbo.klantartikelen.artId = saleItem.saleItemId
    AND abisingen.dbo.klantartikelen.saleItemId IS NULL
    
    UPDATE abisingen.dbo.tblOrganisatie SET businessAddress = '{}'
    UPDATE abisingen.dbo.tblOrganisatie SET businessAddress = JSON_MODIFY(businessAddress,'$.street',Straat) WHERE Straat > ''
    UPDATE abisingen.dbo.tblOrganisatie SET businessAddress = JSON_MODIFY(businessAddress,'$.street2',BezoekHuisnummer) WHERE BezoekHuisnummer > ''
    UPDATE abisingen.dbo.tblOrganisatie SET businessAddress = JSON_MODIFY(businessAddress,'$.street3',BezoekHuisnummerToevoeging) WHERE BezoekHuisnummerToevoeging > ''
    UPDATE abisingen.dbo.tblOrganisatie SET businessAddress = JSON_MODIFY(businessAddress,'$.postalCode',Postcode) WHERE Postcode > ''
    UPDATE abisingen.dbo.tblOrganisatie SET businessAddress = JSON_MODIFY(businessAddress,'$.city',Plaats) WHERE Plaats > ''

    UPDATE abisingen.dbo.tblOrganisatie SET otherAddress = '{}'
    UPDATE abisingen.dbo.tblOrganisatie SET otherAddress = JSON_MODIFY(otherAddress,'$.street',[Straat 2]) WHERE [Straat 2] > ''
    UPDATE abisingen.dbo.tblOrganisatie SET businessAddress = JSON_MODIFY(otherAddress,'$.street2',PostHuisnummer) WHERE PostHuisnummer > ''
    UPDATE abisingen.dbo.tblOrganisatie SET otherAddress = JSON_MODIFY(otherAddress,'$.street3',PostHuisnummerToevoeging) WHERE PostHuisnummerToevoeging > ''
    UPDATE abisingen.dbo.tblOrganisatie SET otherAddress = JSON_MODIFY(otherAddress,'$.city',[Plaats 2]) WHERE [Plaats 2] > ''
    GO
ALTER VIEW dbo.company AS SELECT * FROM abisingen.abis1.company --WHERE supplierId = db_name() 
    GO
ALTER VIEW dbo.ppgItem AS SELECT * FROM abisingen.abis1.ppgItem
    GO
ALTER VIEW dbo.product AS SELECT * FROM abisingen.abis1.product
    GO
ALTER VIEW dbo.saleItem AS SELECT * FROM abisingen.abis1.saleItem --WHERE supplierId = db_name()
    GO
ALTER VIEW dbo.invoice AS SELECT * FROM abisingen.abis1.invoice --WHERE supplierId = db_name() 
    GO
ALTER VIEW dbo.purchaseOrder AS SELECT * FROM abisingen.abis1.purchaseOrder
    GO
ALTER VIEW dbo.purchaseOrderLine AS SELECT * FROM abisingen.abis1.purchaseOrderLine
    GO
-- airo1
-- 078e1398-9849-45e2-b5bd-d1ec001832c5 id in abisingen
USE [663ea0e3-820f-42fc-99db-d54f92cdb292]
    GO
ALTER VIEW dbo.company AS SELECT * FROM abisingen.abis1.company --WHERE supplierId = db_name() 
    GO
ALTER VIEW dbo.ppgItem AS SELECT * FROM abisingen.abis1.ppgItem
    GO
ALTER VIEW dbo.product AS SELECT * FROM abisingen.abis1.product
    GO
ALTER VIEW dbo.saleItem AS SELECT * FROM abisingen.abis1.saleItem --WHERE supplierId = db_name()
    GO
ALTER VIEW dbo.invoice AS SELECT * FROM abisingen.abis1.invoice --WHERE supplierId = db_name() 
    GO
ALTER VIEW dbo.purchaseOrder AS SELECT * FROM abisingen.abis1.purchaseOrder
    GO
ALTER VIEW dbo.purchaseOrderLine AS SELECT * FROM abisingen.abis1.purchaseOrderLine
    GO
