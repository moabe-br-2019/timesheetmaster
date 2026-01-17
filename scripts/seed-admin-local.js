import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execPromise = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function seedAdmin() {
  try {
    console.log('\n=== Timesheet - Seed Admin User (LOCAL) ===\n');

    const email = await question('Email do administrador: ');
    const password = await question('Senha (mínimo 6 caracteres): ');

    if (!email || !password) {
      console.error('Email e senha são obrigatórios!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('Senha deve ter pelo menos 6 caracteres!');
      process.exit(1);
    }

    console.log('\nGerando hash da senha...');
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (email, password_hash, role) VALUES ('${email}', '${passwordHash}', 'admin');`;

    console.log('Inserindo administrador no banco de dados LOCAL...');

    const { stdout, stderr } = await execPromise(
      `wrangler d1 execute timesheet-db --local --command="${sql}"`
    );

    if (stderr && !stderr.includes('Executing')) {
      console.error('Erro:', stderr);
      process.exit(1);
    }

    console.log('\n✅ Administrador criado com sucesso no banco LOCAL!');
    console.log(`\nEmail: ${email}`);
    console.log('Senha: (a senha que você digitou)\n');
  } catch (error) {
    console.error('Erro ao criar administrador:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

seedAdmin();
