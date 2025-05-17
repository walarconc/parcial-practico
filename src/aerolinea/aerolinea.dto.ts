import {IsNotEmpty, IsString} from 'class-validator';
export class AerolineaDto {
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;
    
    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;
    
    @IsString()
    @IsNotEmpty()
    readonly fecha_fundacion: Date;
    
    @IsString()
    @IsNotEmpty()
    readonly pagina_web: string;
}
