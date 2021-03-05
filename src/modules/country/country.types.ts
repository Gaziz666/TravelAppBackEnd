export type Country = {
  _id: string;
  imgUrl: string;
  flagUrl: string;
  videoUrl: string;
  coordinate: {
    x: number;
    y: number;
  };
  name: string;
  about: string;
  area: string;
  population: string;
  populationDensity: string;
  capital: string;
  government: string;
  headOfState: string;
  headOfGovernment: string;
  translations: {
    ru: {
      name: string;
      about: string;
      area: string;
      population: string;
      populationDensity: string;
      capital: string;
      government: string;
      headOfState: string;
      headOfGovernment: string;
    };
    uk: {
      name: string;
      about: string;
      area: string;
      population: string;
      populationDensity: string;
      capital: string;
      government: string;
      headOfState: string;
      headOfGovernment: string;
    };
  };
};
