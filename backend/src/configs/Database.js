import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


// Singleton para a conexão com o banco de dados
class Database {
    static #instance = null;
    #pool = null;


    #createPool() {
        this.#pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT,
            waitForConnections: true,
            connectionLimit: 100,
            queueLimit: 0,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }


    static getInstance() {
        if (!Database.#instance) {
            Database.#instance = new Database();
            Database.#instance.#createPool();
        }
        return Database.#instance;
    }


    getPool() {
        return this.#pool;
    }
}


export const connection = Database.getInstance().getPool();


export async function initializeDatabase() {
    console.log("Inicializando o banco de dados e tabelas...");
    try {
        const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        });


        const dbName = process.env.DB_DATABASE || 'db_s1_r3_r4-at5_pbe_2';

        await tempConnection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await tempConnection.query(`USE \`${dbName}\`;`);


        await tempConnection.query(`
            CREATE TABLE IF NOT EXISTS categorias (
            id INT NOT NULL AUTO_INCREMENT,
            nome VARCHAR(50) NOT NULL,
            descricao VARCHAR(100) NOT NULL,
            data_cad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id))
            ENGINE = InnoDB;
        `);


        await tempConnection.query(`
           CREATE TABLE IF NOT EXISTS produtos (
             id INT NOT NULL AUTO_INCREMENT,
            id_categoria INT NOT NULL,
            nome VARCHAR(50) NOT NULL,
            preco DECIMAL(10,2) NOT NULL,
            estoque INT NOT NULL,
            imagem VARCHAR(200) NOT NULL,
            data_cad TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id, id_categoria),
            INDEX id_categoria_idx (id_categoria ASC) VISIBLE,
            CONSTRAINT id_categoria
            FOREIGN KEY (id_categoria)
            REFERENCES categorias (id)
             ON DELETE NO ACTION
                ON UPDATE NO ACTION)
            ENGINE = InnoDB;
        `);
        await tempConnection.query(`
                CREATE TABLE IF NOT EXISTS pedidos (
                id INT NOT NULL AUTO_INCREMENT,
                valor_total DECIMAL(10,2) NOT NULL,
                 status ENUM("aberto", "finalizado", "pendente") NOT NULL,
                 data_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id))
                ENGINE = InnoDB;
                `);

        await tempConnection.query(`
                CREATE TABLE IF NOT EXISTS itens_pedidos (
     id INT NOT NULL AUTO_INCREMENT,
     id_produto INT NOT NULL,
    id_pedido INT NOT NULL,
     quantidade INT NOT NULL,
     valor_item DECIMAL(10,2) NOT NULL,
     PRIMARY KEY (id, id_produto, id_pedido),
    INDEX id_produto_idx (id_produto ASC) VISIBLE,
     INDEX id_pedido_idx (id_pedido ASC) VISIBLE,
     CONSTRAINT id_produto
    FOREIGN KEY (id_produto)
    REFERENCES produtos (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
    CONSTRAINT id_pedido
    FOREIGN KEY (id_pedido)
    REFERENCES pedidos (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
    ENGINE = InnoDB;
                `)

        await tempConnection.end();
        console.log("Banco de dados e tabelas verificados/criados com sucesso.");
    } catch (error) {
        console.error("Erro ao criar o banco ou as tabelas:", error);
        throw error;
    }
}