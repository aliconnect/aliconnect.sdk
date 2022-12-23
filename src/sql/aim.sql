USE [c9b05c80-4d2b-46c1-abfb-0464854dbd9a]
GO


--SELECT 1 AS A


SELECT name, database_id, create_date, client.id 
FROM sys.databases
LEFT OUTER JOIN [c9b05c80-4d2b-46c1-abfb-0464854dbd9a].dbo.client ON CONVERT(VARCHAR(50),client.id) = databases.name


delete account where accountname = 'max1.van.kampen@alicon.nl'
delete account where accountname = 'test1@alicon.nl'
delete client where domain = 'alicon1'

delete client_user where client_id not in (select id from client)
delete client_user where account_id not in (select id from account)
delete client_host where client_id not in (select id from client)

delete client where ip = '84.83.118.234'

/*

*/
select * from client where id = '07F58AE2-64B7-4077-A3BE-B9FFCF7A9499'

select * from client_user where client_id = 'c8f8c134-8467-4785-a0da-6572f686b504'


select * from client where domain = 'proving7'


--update client set client_secret = newid() where client_secret is null


select * from client where id= 'e7abc208-056c-4e0a-b5cb-17beb9a2a0de'


select * from client_user where client_id= 'e7abc208-056c-4e0a-b5cb-17beb9a2a0de'

select * from client_user where code_id= '2590f40a-743c-4e3b-ac8d-7240b4cdfb99'




select * from account where client_id= 'EB08B999-10DC-4812-A56B-992C68623CCD'


select * from account where accountname= 'max.van.kampen@alicon.nl'
select * from account where accountname= 'max@alicon.nl'

--update account set email = accountname


select * from client_host where client_id= 'EB08B999-10DC-4812-A56B-992C68623CCD'

INSERT INTO client_host (client_id,hostname) SELECT 'C8F8C134-8467-4785-A0DA-6572F686B504','proving-test.aliconnect.nl'





--delete client_user where client_id not in (select id from client)
