export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  username: string;
  avatar: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export default class User {
  public id: string;
  public name: string;
  public email: string;
  public password: string;
  public username: string;
  public avatar: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.username = props.username;
    this.avatar = props.avatar;
  }

  toJSON(): Omit<UserProps, "password"> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  static create(userData: CreateUserInput): User {
    const id = crypto.randomUUID(); // Mejor que Math.random()

    return new User({
      id,
      ...userData,
      username: userData.email.split("@")[0],
      avatar: `https://picsum.photos/seed/${userData.email}/200`,
    });
  }
}
