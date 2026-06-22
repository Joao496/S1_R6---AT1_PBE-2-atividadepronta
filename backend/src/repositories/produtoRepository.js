import { connection } from "../configs/Database.js";

const produtoRepository = {

    criar: async (produto) => {
        const sql = 'INSERT INTO produtos (id_categoria, nome, preco, estoque, imagem) VALUES (?, ?, ?, ?, ?)';
        
        // Extraindo os valores garantindo o uso correto dos getters públicos da classe Produto
        const idCategoria = produto.idCategoria;
        const nome = produto.nomeProduto;
        const preco = produto.valor;
        const estoque = produto.estoque;
        const imagem = produto.vinculoImagem;

        const values = [idCategoria, nome, preco, estoque, imagem];
        
        const [rows] = await connection.execute(sql, values);
        return rows;
    },

    editar: async (produto) => {
        const sql = 'UPDATE produtos SET preco = ?, estoque = ?, imagem = ? WHERE id = ?';
        
        const values = [
            produto.valor, 
            produto.estoque, 
            produto.vinculoImagem, 
            produto.id
        ];
        
        const [rows] = await connection.execute(sql, values);
        return rows;
    },

    selecionar: async () => {
        const sql = "SELECT * FROM produtos";
        const [rows] = await connection.execute(sql);
        return rows;
    },

    deletar: async (id) => {
        const sql = 'DELETE FROM produtos WHERE id = ?';
        const values = [id];

        const [rows] = await connection.execute(sql, values);

        if (rows.affectedRows === 0) {
            throw new Error('Produto não encontrado');
        }

        return rows;
    },

    selecionarPorId: async (id) => {
        const sql = 'SELECT * FROM produtos WHERE id = ?';
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows;
    }

};

export default produtoRepository;