BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[customers] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [image_url] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [customers_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[invoices] (
    [id] INT NOT NULL IDENTITY(1,1),
    [customer_id] INT NOT NULL,
    [amount] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    CONSTRAINT [invoices_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[revenue] (
    [month] NVARCHAR(1000) NOT NULL,
    [revenue] INT NOT NULL,
    CONSTRAINT [revenue_month_key] UNIQUE NONCLUSTERED ([month])
);

-- AddForeignKey
ALTER TABLE [dbo].[invoices] ADD CONSTRAINT [invoices_customer_id_fkey] FOREIGN KEY ([customer_id]) REFERENCES [dbo].[customers]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
