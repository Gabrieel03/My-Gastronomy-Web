import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/fundo-login.png";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthContext } from "../../contexts/AuthContext";
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "../../features/auth/Schemas";
import { cadastrarUsuario } from "../../services/Services";
import { Toast } from "../../utils/toastConfig";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  const { handleLogin, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    watch: watchSignup,
    formState: { errors: signupErrors, isSubmitting: isSignupLoading },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const watchedFotoUrl = watchSignup("foto");
  const watchedPassword = watchSignup("password") || "";
  const passwordRules = [
    { regex: /.{6,}/, text: "Mínimo de 6 caracteres" },
    { regex: /[A-Z]/, text: "Pelo menos uma letra maiúscula" },
    { regex: /[a-z]/, text: "Pelo menos uma letra minúscula" },
    { regex: /[0-9]/, text: "Pelo menos um número" },
    { regex: /[^A-Za-z0-9]/, text: "Pelo menos um símbolo (ex: @#$%)" }
  ];

  const passwordScore = passwordRules.filter(rule => rule.regex.test(watchedPassword)).length;

  const onLogin = async (data: LoginFormValues) => {
    try {
      await handleLogin(data);
      Toast.success("Login realizado com sucesso!");
      navigate("/home");
    } catch (error) {
      Toast.error("E-mail ou senha inválidos.");
      console.error("Falha no login", error);
    }
  };

  const onSignup = async (data: RegisterFormValues) => {
    const toastId = Toast.loading("Criando sua conta...");

    try {
      const payloadCadastro = {
        name: data.name,
        email: data.email,
        password: data.password,
        foto: data.foto
      };

      await cadastrarUsuario('/users', payloadCadastro, () => {
      });

      Toast.dismiss(toastId);
      Toast.success("Cadastro realizado com sucesso! Faça seu login.");
      setIsLogin(true);
    } catch (error) {
      Toast.dismiss(toastId);
      Toast.error("Falha ao criar conta. Verifique os dados.");
      console.error("Erro na API ao cadastrar:", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-neutral-950 font-sans text-white">

      {/* LADO ESQUERDO: IMAGEM */}
      <div
        className="hidden lg:flex w-[55%] flex-col justify-end p-20 relative bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="relative z-10 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
          <h1 className="text-6xl font-bold mb-4 text-primary tracking-tight">My Gastronomy</h1>
          <h2 className="text-4xl font-semibold mb-6">Sabor que chega até você</h2>
          <p className="text-lg text-neutral-300">
            Experience the finest culinary creations delivered directly to your door.
          </p>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIOS */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 sm:p-12 overflow-hidden">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl transition-all duration-500">

          {/* BOTÕES DE ABA (TABS) */}
          <div className="flex w-full border-b border-neutral-700 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 ${isLogin ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-neutral-300"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setAvatarError(false);
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 ${!isLogin ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-neutral-300"
                }`}
            >
              Cadastro
            </button>
          </div>

          {/* ÁREA DOS FORMULÁRIOS COM TRANSIÇÃO ANIMADA*/}
          <div className="relative w-full">
            <AnimatePresence mode="wait">
              {isLogin ? (

                /*FORM DE LOGIN*/
                <motion.form
                  key="form-login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onSubmit={handleLoginSubmit(onLogin)}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 ml-1 mb-1 block uppercase">E-mail</label>
                    <Input {...registerLogin("email")} type="email" placeholder="seu@email.com" error={loginErrors.email?.message} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center ml-1 mb-1">
                      <label className="text-xs font-semibold text-neutral-400 uppercase">Senha</label>
                      <button type="button" className="text-xs text-primary hover:underline transition-all">Esqueci a senha</button>
                    </div>
                    <Input {...registerLogin("password")} type="password" placeholder="••••••••" error={loginErrors.password?.message} />
                  </div>
                  <Button type="submit" isLoading={isLoading} className="mt-2">
                    Entrar
                  </Button>
                </motion.form>

              ) : (

                /*FORM DE CADASTRO*/
                <motion.form
                  key="form-cadastro"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onSubmit={handleSignupSubmit(onSignup)}
                  className="flex flex-col gap-5"
                >

                  {/* AVATAR E URL */}
                  <div className="flex items-center gap-5 mb-2">
                    <div className="w-16 h-16 rounded-full border-2 border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300">
                      {watchedFotoUrl && !avatarError ? (
                        <img
                          src={watchedFotoUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover animate-in fade-in zoom-in"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="text-xs font-semibold text-neutral-400 ml-1 mb-1 block uppercase">Foto de perfil (URL)</label>
                      <Input
                        {...registerSignup("foto")}
                        type="url"
                        placeholder="https://exemplo.com/foto.jpg"
                        error={signupErrors.foto?.message}
                        onChange={(e) => {
                          registerSignup("foto").onChange(e);
                          setAvatarError(false);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 ml-1 mb-1 block uppercase">Nome completo</label>
                    <Input {...registerSignup("name")} type="text" placeholder="Chef João Silva" error={signupErrors.name?.message} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-400 ml-1 mb-1 block uppercase">E-mail</label>
                    <Input {...registerSignup("email")} type="email" placeholder="joao@gastronomy.com" error={signupErrors.email?.message} />
                  </div>

                  {/* SENHA E CHECKLIST */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 ml-1 mb-1 block uppercase">Senha</label>
                    <Input {...registerSignup("password")} type="password" placeholder="••••••••" error={signupErrors.password?.message} />

                    <div className="mt-3 px-1">
                      <div className="flex gap-1 h-1.5 w-full mb-3">
                        {[...Array(4)].map((_, index) => {
                          let isActive = false;
                          if (index === 0) isActive = passwordScore >= 1;
                          if (index === 1) isActive = passwordScore >= 3;
                          if (index === 2) isActive = passwordScore >= 4;
                          if (index === 3) isActive = passwordScore === 5;

                          let colorClass = "bg-neutral-800";
                          if (isActive) {
                            if (passwordScore <= 2) colorClass = "bg-red-500";
                            else if (passwordScore === 3) colorClass = "bg-orange-500";
                            else if (passwordScore === 4) colorClass = "bg-yellow-400";
                            else colorClass = "bg-green-500";
                          }

                          return (
                            <div
                              key={index}
                              className={`h-full flex-1 rounded-full transition-all duration-300 ${colorClass}`}
                            />
                          );
                        })}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {passwordRules.map((rule, idx) => {
                          const isMet = rule.regex.test(watchedPassword);
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 text-[11px] font-medium transition-colors duration-300 ${isMet ? 'text-green-500' : 'text-neutral-500'
                                }`}
                            >
                              {isMet ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                              )}
                              {rule.text}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSignupLoading}
                    className="mt-4"
                    disabled={passwordScore < 5}
                  >
                    Criar conta
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}