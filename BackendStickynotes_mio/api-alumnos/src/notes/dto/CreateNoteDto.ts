import { ApiProperty } from '@nestjs/swagger';
// import { Transform } from 'class-transformer'; //Sirve para cambiar valores a un formato especifico
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
    @ApiProperty({
        description: 'Descripción o contenido de la nota',
        example: 'Comprar materiales para el proyecto',
        maxLength: 80,
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @MaxLength(80)
    ds: string;
}